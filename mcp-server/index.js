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

/**
 * Install: return a single text document with clear instructions and
 * each file's content inline, delimited so the agent can read and
 * write each one directly using its Write tool. No JSON parsing needed.
 */
function buildInstallResponse(catalogName, skillName) {
  const manifest = loadCatalogManifest(catalogName);
  if (!manifest) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Catalog "${catalogName}" not found.`,
        },
      ],
    };
  }

  const catalogPath = path.join(REPO_ROOT, catalogName);
  const allSkills = collectSkills(catalogPath);

  // Validate skill_name
  if (skillName) {
    const match = allSkills.find((s) => s.name === skillName);
    if (!match) {
      const available = allSkills.map((s) => s.name).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Error: Skill "${skillName}" not found in "${catalogName}". Available: ${available}`,
          },
        ],
      };
    }
  }

  const targetSkills = skillName
    ? allSkills.filter((s) => s.name === skillName)
    : allSkills;

  const claudeMd = readFile(path.join(catalogPath, "CLAUDE.md"));
  const dirs = (manifest.install?.directories || []);

  // Build a single document the agent can follow step by step
  const sections = [];

  sections.push([
    `# Install: ${manifest.name} (${manifest.version})`,
    "",
    manifest.description,
    "",
    "## How to install",
    "",
    "Follow these steps using your standard tools (Bash for mkdir, Write for files):",
    "",
    `**Step 1:** Create directories:`,
    "```bash",
    dirs.map((d) => `mkdir -p ${d}`).join(" && "),
    "```",
    "",
    `**Step 2:** Write each file below. Each section has the exact file path and the exact content to write.`,
    "",
    `**Step 3:** Tell the user: ${manifest.post_install_message || "Done."}`,
  ].join("\n"));

  // CLAUDE.md
  if (claudeMd) {
    sections.push([
      "========================================",
      "WRITE FILE: CLAUDE.md",
      "NOTE: If CLAUDE.md already exists, append this content as a new section instead of overwriting.",
      "========================================",
      "",
      claudeMd,
    ].join("\n"));
  }

  // Each skill
  for (const skill of targetSkills) {
    sections.push([
      "========================================",
      `WRITE FILE: .claude/skills/${skill.name}/SKILL.md`,
      "========================================",
      "",
      skill.content,
    ].join("\n"));
  }

  return {
    content: [{ type: "text", text: sections.join("\n\n") }],
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
        'Set action to "install" to get file contents with paths — follow the returned instructions to write each file using your Write tool. ' +
        'Do NOT parse the output with scripts. Just read the instructions and use mkdir + Write for each file. ' +
        'Trigger phrases: "install marketing skills", "what skills are available", "set up sales workspace".',
      inputSchema: z.object({
        action: z
          .enum(["browse", "install"])
          .optional()
          .describe(
            '"browse" (default) returns summaries. "install" returns full file contents with paths.'
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
            'Optional: target a specific skill (e.g. "seo"). Only used with a catalog.'
          ),
      }),
    },
    async ({ action, catalog, skill_name }) => {
      const effectiveAction = action || "browse";

      // Install mode returns its own content array (one item per file)
      if (catalog && effectiveAction === "install") {
        return buildInstallResponse(catalog, skill_name);
      }

      // Browse modes return JSON
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
