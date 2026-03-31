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

async function main() {
  const server = new McpServer({
    name: "skill-catalog",
    version: "1.0.0",
  });

  // ── browse-catalog ──────────────────────────────────────────────
  // Light tool: lists catalogs or skills. Small response, no file content.
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

  // ── get-skill ───────────────────────────────────────────────────
  // Returns ONE file at a time. Agent calls this in a loop per skill.
  // Each response is small enough to stay in context.
  server.registerTool(
    "get-skill",
    {
      title: "Get Skill File",
      description:
        'Get the content of a single skill file or the CLAUDE.md for a catalog. ' +
        'Returns the file path and content. Use your Write tool to save it. ' +
        'Call once per file. To install a full catalog, first call browse-catalog to get the skill list, ' +
        'then call get-skill for each skill name, plus once with file_type="claude-md" for the CLAUDE.md.',
      inputSchema: z.object({
        catalog: z
          .string()
          .describe('Catalog name (e.g. "marketing", "sales").'),
        skill_name: z
          .string()
          .optional()
          .describe(
            'Skill to retrieve (e.g. "seo", "google-analytics"). Omit if fetching CLAUDE.md.'
          ),
        file_type: z
          .enum(["skill", "claude-md"])
          .optional()
          .describe(
            '"skill" (default) returns a SKILL.md. "claude-md" returns the catalog\'s CLAUDE.md.'
          ),
      }),
    },
    async ({ catalog, skill_name, file_type }) => {
      const effectiveType = file_type || "skill";
      const manifest = loadCatalogManifest(catalog);
      if (!manifest) {
        return {
          content: [{ type: "text", text: `Error: Catalog "${catalog}" not found.` }],
        };
      }

      const catalogPath = path.join(REPO_ROOT, catalog);

      if (effectiveType === "claude-md") {
        const claudeMd = readFile(path.join(catalogPath, "CLAUDE.md"));
        if (!claudeMd) {
          return {
            content: [{ type: "text", text: `No CLAUDE.md found in catalog "${catalog}".` }],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  path: "CLAUDE.md",
                  merge_hint: "append_as_section",
                  post_install_message: manifest.post_install_message,
                  directories_to_create: manifest.install?.directories || [],
                  content: claudeMd,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // skill type
      if (!skill_name) {
        return {
          content: [{ type: "text", text: "Error: skill_name is required when file_type is skill." }],
        };
      }

      const allSkills = collectSkills(catalogPath);
      const skill = allSkills.find((s) => s.name === skill_name);
      if (!skill) {
        const available = allSkills.map((s) => s.name).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Error: Skill "${skill_name}" not found. Available: ${available}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                path: `.claude/skills/${skill.name}/SKILL.md`,
                content: skill.content,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
