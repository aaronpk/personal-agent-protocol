import { ALL_DOCS_PAGES } from "../content/docs";

// The outline of the docs pages, shown in the left navigation and used by comments and analytics.
// It's built on the server from each page's headings (lib/docs-content.ts) and passed to the
// components that need it.

export type OutlineSection = { id: string; label: string; subsections?: OutlineSection[] };
export type OutlinePage = { title: string; href: string; sections: OutlineSection[] };

// Every section and subsection on a docs page in order, or none for an unknown page.
export function allSections(outline: OutlinePage[], href: string): OutlineSection[] {
    const flat = (sections: OutlineSection[]): OutlineSection[] =>
        sections.flatMap((section) => [section, ...flat(section.subsections ?? [])]);
    return flat(outline.find((p) => p.href === href)?.sections ?? []);
}

// The ids of every section and subsection on a docs page, or none for an unknown page.
export function sectionIds(outline: OutlinePage[], href: string): string[] {
    return allSections(outline, href).map((section) => section.id);
}

// The Markdown file a docs page is saved as in the docs download: /docs/extensions/operations
// becomes extensions-operations.md.
export function markdownFileName(href: string): string {
    return href.replace(/^\/docs\//, "").replace(/\//g, "-") + ".md";
}

// Every page comments can be on: the home page and the docs pages of every version.
export const PAGE_HREFS = ["/", ...ALL_DOCS_PAGES.map((p) => p.href)];
