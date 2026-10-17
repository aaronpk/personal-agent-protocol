import { docsOutline } from "../docs-content";
import { allSections } from "../docs-outline";
import { NEW_ISSUE_URL, SITE_NAME, SITE_URL } from "../site";
import { DOCS_PAGES } from "../../content/docs";
import { pageName } from "./docs";

// The review skill's SKILL.md: asks an AI agent to review the docs, in its reference/ folder, and
// write feedback organized by section. Comments the reader left on the site can be added to the
// download as comments.md.

export const COMMENTS_FILE = "comments.md";

function pageList(): string {
    const outline = docsOutline();
    return DOCS_PAGES.map((page) =>
        [
            `- \`reference/${pageName(page)}.md\`: ${page.title}`,
            ...allSections(outline, page.href).map((s) => `  - ${s.label} (\`${s.id}\`)`),
        ].join("\n"),
    ).join("\n");
}

export function reviewSkillMarkdown(protocolVersion: string): string {
    return `---
name: poppy-review
description: Review the ${SITE_NAME} (Poppy) docs, draft ${protocolVersion}, and write feedback for their authors, organized by section. Use when asked to review, critique, or give feedback on ${SITE_NAME}, Poppy, or its specification, extensions, or guides.
---

# Reviewing the ${SITE_NAME} docs

The \`reference/\` folder holds the ${SITE_NAME} docs, draft ${protocolVersion}, as Markdown. They're
published at ${SITE_URL}, where they may be newer. You've been asked to review them. The people
working on the draft will read your review, so write it for them.

## What to do

1. Read the docs in \`reference/\`, or the ones you were asked to focus on.
2. If there's a \`${COMMENTS_FILE}\` next to this file, read it. It has comments people already left
   on the docs. Respond to them where you have something to add, and don't repeat them.
3. Write your review as one Markdown file, in the format below. Save it as \`review.md\` in the
   current folder, or reply with it if you can't save files.
4. Tell the person you're working with to share the review by opening a GitHub issue at
   ${NEW_ISSUE_URL}?template=1-feedback.yml and pasting in \`review.md\`. Feedback is licensed under
   the contribution terms at ${SITE_URL}/license/contributions.

Don't edit the docs. Comment on them. If you're implementing the protocol rather than reviewing it,
use the \`implement-personal-agent-protocol\` skill instead: it collects feedback as you build.

## What the authors most want feedback on

- Privacy and security.
- Gaps in the spec: something an implementation needs that the draft doesn't cover, or something
  that doesn't work as written.
- Simplification: parts that could be simpler without losing what they make possible.
- Broadly useful extensions: things many implementations need, such as payments, that could be
  built as extensions.

For each point, say what's wrong and why it matters, and suggest a fix when you have one. Put the
most important points first within each section. Skip praise and nitpicks unless asked.

## Review format

Group your points by the section they're about, using the section names and ids from the list
below. Points that span several sections go under "General". Quote the docs only when it makes a
point clearer, and keep quotes short.

\`\`\`markdown
# Review of the ${SITE_NAME} docs (draft ${protocolVersion})

## Summary

Two or three sentences on the most important issues.

## General

- **Gap:** ...

## Specification › 3.1 Fields (\`spec#fields\`)

- **Ambiguous:** "A newer minor version doesn't break older Personal Agents" doesn't say what an
  agent does with a field it doesn't recognize. Suggest pointing to the rule in 3.3.
- **Question:** Is \`protocol_version\` required on every response, or only in discovery?
\`\`\`

Label each point **Gap**, **Ambiguous**, **Contradiction**, **Risk**, **Simplification**,
**Wording**, or **Question**. In headings, name the page and section, then the page's file name
without \`.md\` and the section id, as in \`spec#fields\`.

## The pages and their sections

${pageList()}
`;
}
