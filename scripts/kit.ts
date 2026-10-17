import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kitProblems } from "../lib/kit/checks";
import { GENERATED_DIRS, generatedFiles } from "../lib/kit/files";

// `pnpm kit`: writes the generated kit (skills/ and .claude-plugin/) from kit/ and the docs, then
// runs the build's checks on it. `pnpm kit --check` only runs the checks.

const root = process.cwd();

if (!process.argv.includes("--check")) {
    for (const dir of GENERATED_DIRS) {
        rmSync(join(root, dir), { recursive: true, force: true });
    }
    const files = generatedFiles();
    for (const file of files) {
        const path = join(root, file.path);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.content);
    }
    console.log(`Wrote ${files.length} files.`);
}

const problems = kitProblems();
if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
}
console.log("The kit checks pass.");
