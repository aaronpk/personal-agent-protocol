import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOG } from "../../kit/company/validate/catalog.ts";
import { SITE_URL } from "../site";
import { headingIds, pageByName, pageText } from "./docs";
import { checkSpecExamples } from "./examples";
import { generatedFiles, staleFiles } from "./files";

// The build's checks on the kit. Each returns problems as messages; checkKit throws on any, which
// fails the build.

const SCHEMA_DIR = join(process.cwd(), "kit/company/schemas");

function schemas(): Record<string, object> {
    return Object.fromEntries(
        readdirSync(SCHEMA_DIR)
            .filter((name) => name.endsWith(".schema.json"))
            .map((name) => [name, JSON.parse(readFileSync(join(SCHEMA_DIR, name), "utf8"))]),
    );
}

// Text for comparing a quote with the docs: no backticks or emphasis, straight quotes, one space.
function normalized(text: string): string {
    return text
        .replace(/[`*]/g, "")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

// Each link to the docs in the kit goes to a page and heading id that exist.
function checkLinks(): string[] {
    const problems: string[] = [];
    const site = SITE_URL.replace(/[.]/g, "\\.");
    const pattern = new RegExp(`${site}/docs/([a-z0-9/-]+)(?:#([A-Za-z0-9-]+))?`, "g");
    for (const file of generatedFiles()) {
        for (const match of file.content.matchAll(pattern)) {
            const [url, path, id] = match;
            const page = pageByName(path.split("/").pop()!);
            if (!page || page.href !== `/docs/${path.replace(/\.md$/, "")}`) {
                problems.push(`${file.path}: ${url} isn't a docs page.`);
            } else if (id && !headingIds(page).has(id)) {
                problems.push(`${file.path}: ${url} links to a heading id that doesn't exist.`);
            }
        }
    }
    return problems;
}

// Each validator check cites a heading that exists and quotes its page word for word.
function checkCatalog(): string[] {
    const problems: string[] = [];
    const texts = new Map<string, string>();
    for (const check of CATALOG) {
        const [name, id] = check.section.split("#");
        const page = pageByName(name);
        if (!page || !headingIds(page).has(id)) {
            problems.push(`catalog.ts: ${check.id} cites ${check.section}, which doesn't exist.`);
            continue;
        }
        if (!texts.has(name)) {
            texts.set(name, normalized(pageText(page)));
        }
        if (!texts.get(name)!.includes(normalized(check.quote))) {
            problems.push(
                `catalog.ts: ${check.id} quotes text that isn't on the ${name} page: "${check.quote}"`,
            );
        }
    }
    return problems;
}

export function kitProblems(): string[] {
    const stale = staleFiles();
    return [
        ...checkSpecExamples(schemas()),
        ...checkLinks(),
        ...checkCatalog(),
        ...(stale.length
            ? [
                  `The kit is out of date. Run \`pnpm kit\`. Changed: ${stale.slice(0, 10).join(", ")}`,
              ]
            : []),
    ];
}

let checked = false;

// Throws if the kit has problems. Runs once per build.
export function checkKit() {
    if (checked) {
        return;
    }
    const problems = kitProblems();
    if (problems.length) {
        throw new Error(`The kit has problems:\n${problems.join("\n")}`);
    }
    checked = true;
}
