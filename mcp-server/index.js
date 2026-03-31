const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");

// GitHub raw URL base for direct file downloads
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/leet-c1/skill-catalog/main";

/** Read a file, return null if missing */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Read and parse a JSON file */
function readJson(filePath) {
  const content = readFile(filePath);
  return content ? JSON.parse(content) : null;
}

/** Extract name + description from SKILL.md frontmatter */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key && val) fm[key] = val;
  }
  return fm;
}

/** Discover skills in a catalog's skills/ directory */
function collectSkills(catalogPath) {
  const skillsDir = path.join(catalogPath, "skills");
  const skills = [];
  if (!fs.existsSync(skillsDir)) return skills;

  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
    const content = readFile(skillFile);
    if (content) {
      const fm = parseFrontmatter(content);
      skills.push({
        name: entry.name,
        description: fm.description || "",
        content,
      });
    }
  }
  return skills;
}

/** Load the top-level catalog index */
function loadRootCatalog() {
  return readJson(path.join(REPO_ROOT, "catalog.json"));
}

/** Load a single catalog's manifest */
function loadCatalogManifest(catalogName) {
  return readJson(path.join(REPO_ROOT, catalogName, "catalog.json"));
}

async function main() {
  const server = new McpServer({
    name: "skill-catalog",
    version: "1.0.0",
  });

  // ── browse-catalog ──────────────────────────────────────────────
  server.registerTool(
    "browse-catalog",
    {
      title: "Browse Skill Catalog",
      description:
        'List available skill catalogs, or list skills within a catalog. ' +
        'Call with no arguments to see all catalogs. Set catalog to see its skills. ' +
        'Trigger phrases: "what skills are available", "list catalogs", "show marketing skills".',
      inputSchema: z.object({
        catalog: z
          .string()
          .optional()
          .describe(
            'Catalog name (e.g. "marketing", "sales"). Omit to list all catalogs.'
          ),
      }),
    },
    async ({ catalog }) => {
      let result;
      if (!catalog) {
        const root = loadRootCatalog();
        if (!root) {
          result = { error: "No catalog.json found." };
        } else {
          result = { version: root.version, catalogs: root.catalogs };
        }
      } else {
        const manifest = loadCatalogManifest(catalog);
        if (!manifest) {
          result = { error: `Catalog "${catalog}" not found.` };
        } else {
          const catalogPath = path.join(REPO_ROOT, catalog);
          const skills = collectSkills(catalogPath);
          result = {
            manifest,
            skills: skills.map((s) => ({
              name: s.name,
              description: s.description,
            })),
          };
        }
      }
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── install-catalog ─────────────────────────────────────────────
  // Returns a list of directories to create and curl commands to run.
  // Agent creates dirs then runs each curl. No file content passes
  // through the agent. Works on macOS, Windows 10+, and Linux.
  server.registerTool(
    "install-catalog",
    {
      title: "Install Skill Catalog",
      description:
        'Install a skill catalog into the current project. Returns directories to create and curl commands to run. ' +
        'First create the directories, then run each curl command. Do NOT use Write — curl downloads files directly. ' +
        'Trigger phrases: "install marketing skills", "set up sales workspace", "install skills".',
      inputSchema: z.object({
        catalog: z
          .string()
          .describe('Catalog name (e.g. "marketing", "sales").'),
        skill_name: z
          .string()
          .optional()
          .describe('Optional: install only this skill (e.g. "seo").'),
      }),
    },
    async ({ catalog, skill_name }) => {
      const manifest = loadCatalogManifest(catalog);
      if (!manifest) {
        return {
          content: [{ type: "text", text: `Error: Catalog "${catalog}" not found.` }],
        };
      }

      const catalogPath = path.join(REPO_ROOT, catalog);
      const allSkills = collectSkills(catalogPath);

      if (skill_name) {
        const match = allSkills.find((s) => s.name === skill_name);
        if (!match) {
          const available = allSkills.map((s) => s.name).join(", ");
          return {
            content: [{ type: "text", text: `Error: Skill "${skill_name}" not found. Available: ${available}` }],
          };
        }
      }

      const targetSkills = skill_name
        ? allSkills.filter((s) => s.name === skill_name)
        : allSkills;

      // Directories to create
      const dirs = [
        ...(manifest.install?.directories || []),
        ...targetSkills.map((s) => `.claude/skills/${s.name}`),
      ];

      // Curl commands — one per file
      const downloads = [];

      const claudeMd = readFile(path.join(catalogPath, "CLAUDE.md"));
      if (claudeMd) {
        downloads.push({
          url: `${GITHUB_RAW_BASE}/${catalog}/CLAUDE.md`,
          dest: "CLAUDE.md",
        });
      }

      for (const skill of targetSkills) {
        downloads.push({
          url: `${GITHUB_RAW_BASE}/${catalog}/skills/${skill.name}/SKILL.md`,
          dest: `.claude/skills/${skill.name}/SKILL.md`,
        });
      }

      const result = {
        catalog: manifest.name,
        version: manifest.version,
        directories: dirs,
        downloads,
        post_install_message: manifest.post_install_message,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
