import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { DOCS_PAGES } from "../../content/docs";
import { pageMarkdown } from "../docs-content";
import { REPO_URL, SITE_NAME, SITE_URL } from "../site";
import { checklistMarkdown } from "./checklist";
import { pageName } from "./docs";
import { reviewSkillMarkdown } from "./review";

// The kit's two skills, as files: implement-personal-agent-protocol, for a Company implementing the protocol, and
// poppy-review, for reviewing the docs. Each is a folder with a SKILL.md. `pnpm kit` writes them to
// skills/, where agents install them from the repository, and the site serves the same files.

export type KitFile = { path: string; content: string };

export const SKILLS = {
    company: { name: "implement-personal-agent-protocol", source: "kit/company" },
    review: { name: "poppy-review" },
} as const;

export type SkillId = keyof typeof SKILLS;

const ROOT = process.cwd();

// Kit sources that stay in the repository: the validator's tests.
const NOT_SHIPPED = ["validate/test/"];

// The protocol version the docs describe, such as "0.1", from the spec's introduction.
export function protocolVersion(): string {
    const markdown = pageMarkdown("/docs/spec");
    const match = /This is draft version (\d+(?:\.\d+)*)\./.exec(markdown);
    if (!match) {
        throw new Error(
            'spec.mdx: the kit needs "This is draft version <n>." to find the version.',
        );
    }
    return match[1];
}

function filesUnder(dir: string): string[] {
    return readdirSync(dir)
        .sort()
        .flatMap((name) => {
            const path = join(dir, name);
            return statSync(path).isDirectory() ? filesUnder(path) : [path];
        });
}

// The docs as Markdown, with links to the site made absolute, since the files are read offline.
function referenceFiles(): KitFile[] {
    return DOCS_PAGES.map((page) => ({
        path: `reference/${pageName(page)}.md`,
        content: pageMarkdown(page.href).replace(/\]\(\//g, `](${SITE_URL}/`),
    }));
}

function companySkill(): KitFile[] {
    const source = join(ROOT, SKILLS.company.source);
    const files = filesUnder(source)
        .map((path) => ({ path: relative(source, path), content: readFileSync(path, "utf8") }))
        .filter((file) => !NOT_SHIPPED.some((prefix) => file.path.startsWith(prefix)));
    return [
        ...files,
        { path: "checklist.md", content: checklistMarkdown(protocolVersion()) },
        ...referenceFiles(),
    ];
}

function reviewSkill(): KitFile[] {
    return [
        { path: "SKILL.md", content: reviewSkillMarkdown(protocolVersion()) },
        ...referenceFiles(),
    ];
}

// A skill's files, with paths inside its folder.
export function skillFiles(id: SkillId): KitFile[] {
    const files = id === "company" ? companySkill() : reviewSkill();
    return files.sort((a, b) => a.path.localeCompare(b.path));
}

// The Claude Code plugin marketplace: one plugin holding both skills.
function marketplace(): string {
    const skills = Object.values(SKILLS).map((skill) => `./skills/${skill.name}`);
    return (
        JSON.stringify(
            {
                name: "personal-agent-protocol",
                owner: { name: SITE_NAME },
                metadata: {
                    description: `Skills for implementing and reviewing ${SITE_NAME} (Poppy).`,
                    version: protocolVersion(),
                },
                plugins: [
                    {
                        name: "personal-agent-protocol",
                        description: `Implement ${SITE_NAME} (Poppy) for a Company, with a validator, or review the docs.`,
                        source: "./",
                        strict: false,
                        homepage: `${SITE_URL}/kit/company`,
                        repository: REPO_URL,
                        skills,
                    },
                ],
            },
            null,
            4,
        ) + "\n"
    );
}

// Every generated file, with its path in the repository.
export function generatedFiles(): KitFile[] {
    return [
        { path: ".claude-plugin/marketplace.json", content: marketplace() },
        ...(Object.keys(SKILLS) as SkillId[]).flatMap((id) =>
            skillFiles(id).map((file) => ({
                path: `skills/${SKILLS[id].name}/${file.path}`,
                content: file.content,
            })),
        ),
    ];
}

// The generated folders, which `pnpm kit` replaces.
export const GENERATED_DIRS = Object.values(SKILLS).map((skill) => `skills/${skill.name}`);

// Generated files that are missing, changed, or no longer generated. The build fails on any.
export function staleFiles(): string[] {
    const expected = new Map(generatedFiles().map((file) => [file.path, file.content]));
    const stale: string[] = [];
    for (const [path, content] of expected) {
        let current: string | undefined;
        try {
            current = readFileSync(join(ROOT, path), "utf8");
        } catch {
            current = undefined;
        }
        if (current !== content) {
            stale.push(path);
        }
    }
    for (const dir of GENERATED_DIRS) {
        let existing: string[] = [];
        try {
            existing = filesUnder(join(ROOT, dir)).map((path) => relative(ROOT, path));
        } catch {
            existing = [];
        }
        stale.push(...existing.filter((path) => !expected.has(path)));
    }
    return stale;
}
