const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");

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

/** Browse: list all catalogs */
function browseCatalogs() {
  const root = loadRootCatalog();
  if (!root) return { error: "No catalog.json found at repo root." };
  return {
    version: root.version,
    catalogs: root.catalogs,
  };
}

/** Browse: list skills in one catalog */
function browseCatalog(catalogName) {
  const manifest = loadCatalogManifest(catalogName);
  if (!manifest) return { error: `Catalog "${catalogName}" not found.` };

  const catalogPath = path.join(REPO_ROOT, catalogName);
  const skills = collectSkills(catalogPath);

  return {
    manifest,
    skills: skills.map((s) => ({ name: s.name, description: s.description })),
  };
}

/** Install: write files directly to the target directory */
function installCatalog(catalogName, skillName, targetDir) {
  const manifest = loadCatalogManifest(catalogName);
  if (!manifest) {
    return { error: `Catalog "${catalogName}" not found.` };
  }

  const catalogPath = path.join(REPO_ROOT, catalogName);
  const allSkills = collectSkills(catalogPath);

  if (skillName) {
    const match = allSkills.find((s) => s.name === skillName);
    if (!match) {
      const available = allSkills.map((s) => s.name).join(", ");
      return { error: `Skill "${skillName}" not found. Available: ${available}` };
    }
  }

  const targetSkills = skillName
    ? allSkills.filter((s) => s.name === skillName)
    : allSkills;

  // Create directories
  for (const dir of manifest.install?.directories || []) {
    fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
  }

  const written = [];

  // Write CLAUDE.md
  const claudeMd = readFile(path.join(catalogPath, "CLAUDE.md"));
  if (claudeMd) {
    const dest = path.join(targetDir, "CLAUDE.md");
    const existing = readFile(dest);
    if (existing) {
      fs.writeFileSync(dest, existing + "\n\n" + claudeMd);
      written.push("CLAUDE.md (appended to existing)");
    } else {
      fs.writeFileSync(dest, claudeMd);
      written.push("CLAUDE.md");
    }
  }

  // Write each skill
  for (const skill of targetSkills) {
    const skillDir = path.join(targetDir, ".claude", "skills", skill.name);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), skill.content);
    written.push(`.claude/skills/${skill.name}/SKILL.md`);
  }

  return {
    installed: manifest.name,
    version: manifest.version,
    files_written: written,
    post_install_message: manifest.post_install_message,
  };
}

async function main() {
  const server = new McpServer({
    name: "skill-catalog",
    version: "1.0.0",
  });

  server.registerTool(
    "skill-catalog",
    {
      title: "Skill Catalog",
      description:
        'Browse and install Claude Code skill sets. ' +
        'Call with no arguments to list available catalogs (e.g. marketing, sales). ' +
        'Set catalog to browse skills within one. ' +
        'Set action to "install" with target_dir to write skill files directly to disk — no extra steps needed. ' +
        'Trigger phrases: "install marketing skills", "what skills are available", "set up sales workspace".',
      inputSchema: z.object({
        action: z
          .enum(["browse", "install"])
          .optional()
          .describe(
            '"browse" (default) returns summaries. "install" writes files directly to target_dir.'
          ),
        catalog: z
          .string()
          .optional()
          .describe(
            'Catalog name (e.g. "marketing", "sales"). Omit to list all catalogs.'
          ),
        skill_name: z
          .string()
          .optional()
          .describe(
            'Optional: install a specific skill only (e.g. "seo").'
          ),
        target_dir: z
          .string()
          .optional()
          .describe(
            'Absolute path to the directory where files should be written. Required for action "install". Use the current working directory.'
          ),
      }),
    },
    async ({ action, catalog, skill_name, target_dir }) => {
      const effectiveAction = action || "browse";

      if (catalog && effectiveAction === "install") {
        if (!target_dir) {
          return {
            content: [{ type: "text", text: "Error: target_dir is required for install." }],
          };
        }
        const result = installCatalog(catalog, skill_name, target_dir);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      let result;
      if (!catalog) {
        result = browseCatalogs();
      } else {
        result = browseCatalog(catalog);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
