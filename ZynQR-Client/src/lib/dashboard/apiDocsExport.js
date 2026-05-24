import { API_DOCS_INTRO, API_ENDPOINTS, API_CODEBASE_REPOS, API_ENV_VARS, API_FRONTEND_CLIENTS } from "./apiDocsContent.js";

export function buildApiReferenceJson() {
  return JSON.stringify(
    {
      title: API_DOCS_INTRO.title,
      basePath: API_DOCS_INTRO.basePath,
      updated: API_DOCS_INTRO.updated,
      environment: API_ENV_VARS,
      frontendClients: API_FRONTEND_CLIENTS,
      repositories: API_CODEBASE_REPOS,
      endpoints: API_ENDPOINTS,
    },
    null,
    2,
  );
}

export function buildApiReferenceMarkdown() {
  const lines = [
    `# ${API_DOCS_INTRO.title}`,
    "",
    API_DOCS_INTRO.subtitle,
    "",
    `**Base path:** \`${API_DOCS_INTRO.basePath}\`  `,
    `**Updated:** ${API_DOCS_INTRO.updated}`,
    "",
    "## Environment",
    "",
    ...API_ENV_VARS.flatMap((v) => [
      `### ${v.name}`,
      `- **Where:** ${v.where}`,
      v.example ? `- **Example:** \`${v.example}\`` : "",
      `- **Why:** ${v.why}`,
      "",
    ]),
    "## Endpoints",
    "",
  ];

  for (const e of API_ENDPOINTS) {
    lines.push(`### ${e.method} ${API_DOCS_INTRO.basePath}${e.path}`, "");
    lines.push(`**Auth:** ${e.auth ? "Bearer required" : "Public"}  `);
    lines.push(`**Summary:** ${e.summary}  `);
    lines.push(`**Why:** ${e.why}  `);
    if (e.body) lines.push(`**Body:** \`${e.body}\`  `);
    if (e.query) lines.push(`**Query:** \`${e.query}\`  `);
    if (e.response) lines.push(`**Response:** ${e.response}  `);
    if (e.frontend) lines.push(`**Frontend:** ${e.frontend}  `);
    if (e.rateLimit) lines.push(`**Rate limit:** ${e.rateLimit}  `);
    lines.push("");
  }

  lines.push("## Frontend clients", "");
  for (const c of API_FRONTEND_CLIENTS) {
    lines.push(`- \`${c.file}\` — ${c.role}`);
  }

  return lines.join("\n");
}

/** @param {string} filename @param {string} content @param {string} mime */
export function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadApiReferenceJson() {
  downloadTextFile("zynqr-api-reference.json", buildApiReferenceJson(), "application/json");
}

export function downloadApiReferenceMarkdown() {
  downloadTextFile("zynqr-api-reference.md", buildApiReferenceMarkdown(), "text/markdown");
}
