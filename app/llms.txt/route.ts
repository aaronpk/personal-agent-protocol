import { DOCS_PAGES } from "../../content/docs";
import { SITE_NAME, SITE_URL } from "../../lib/site";

export const dynamic = "force-static";

// The site for AI agents (llmstxt.org): the docs as Markdown, and the kit's two skills.
export function GET() {
    const text = `# ${SITE_NAME}

> An open protocol for every company and every personal agent. Personal agents discover
> participating companies, sign users in, and get things done through APIs, web pages, and company
> agents. "Poppy" for short. The docs are a draft.

## Docs

${DOCS_PAGES.map((page) => `- [${page.navTitle}](${SITE_URL}${page.href}.md): ${page.description}`).join("\n")}

## Skills

- [Company implementation kit](${SITE_URL}/kit/company/SKILL.md): For a company adding Poppy support to its systems. Surveys what exists, designs with the engineer, builds in milestones, and checks each one with a validator. About the kit: ${SITE_URL}/kit/company
- [Docs review kit](${SITE_URL}/kit/review/SKILL.md): For reviewing the docs and writing feedback for their authors.
`;
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
