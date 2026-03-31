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
 * Install: return MCP content array with one item per file.
 * First item is instructions + manifest. Each subsequent item
 * is a single file the agent should write using its Write tool.
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

  const contentItems = [];

  // First item: instructions for the agent
  const dirs = (manifest.install?.directories || []).map((d) => `  mkdir -p ${d}`).join("\n");
  const fileList = [];
  const claudeMd = readFile(path.join(catalogPath, "CLAUDE.md"));
  if (claudeMd) fileList.push("CLAUDE.md (merge_hint: append_as_section)");
  for (const s of targetSkills) {
    fileList.push(`.claude/skills/${s.name}/SKILL.md`);
  }

  contentItems.push({
    type: "text",
    text: [
      `# Install: ${manifest.name} (${manifest.version})`,
      "",
      `${manifest.description}`,
      "",
      "## Instructions",
      "",
      `Create these directories first:`,
      dirs,
      "",
      `Then write each file below using the Write tool. Each file is returned as a separate item with a "--- FILE: <path> ---" header followed by the content to write.`,
      "",
      `Files to write (${fileList.length}):`,
      ...fileList.map((f) => `  - ${f}`),
      "",
      `## Post-install`,
      "",
      manifest.post_install_message || "Done.",
    ].join("\n"),
  });

  // CLAUDE.md
  if (claudeMd) {
    contentItems.push({
      type: "text",
      text: `--- FILE: CLAUDE.md ---\n--- MERGE_HINT: append_as_section ---\n${claudeMd}`,
    });
  }

  // Each skill as its own content item
  for (const skill of targetSkills) {
    contentItems.push({
      type: "text",
      text: `--- FILE: .claude/skills/${skill.name}/SKILL.md ---\n${skill.content}`,
    });
  }

  return { content: contentItems };
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
        'Set action to "install" to get installable files — each file is returned as a separate content item ' +
        'with a "--- FILE: <path> ---" header. Create the listed directories, then use Write to save each file at its path. ' +
        'No scripting or JSON parsing needed. ' +
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
