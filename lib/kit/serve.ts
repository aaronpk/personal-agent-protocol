import { deflateRawSync } from "node:zlib";
import { zip } from "../zip";
import { checkKit } from "./checks";
import { SKILLS, skillFiles, type KitFile, type SkillId } from "./files";

// The site's copy of the skill: its files one by one, under /kit/company/, and as a zip holding
// the skill's folder, which Claude apps take as an upload. Every route checks the kit first, so the
// build fails if it's stale or broken.

function updated(): string {
    return process.env.NEXT_PUBLIC_DOCS_UPDATED ?? new Date().toISOString();
}

function skillKit(id: SkillId): { updated: string; files: KitFile[] } {
    checkKit();
    const folder = `${SKILLS[id].name}/`;
    return {
        updated: updated(),
        files: [
            { path: folder, content: "" },
            ...skillFiles(id).map((file) => ({ path: folder + file.path, content: file.content })),
        ],
    };
}

export function skillZipResponse(id: SkillId): Response {
    const kit = skillKit(id);
    return new Response(zip(kit.files, new Date(kit.updated), deflateRawSync), {
        headers: { "Content-Type": "application/zip" },
    });
}

export function skillParams(id: SkillId): { path: string[] }[] {
    checkKit();
    return skillFiles(id).map((file) => ({ path: file.path.split("/") }));
}

const TYPES: Record<string, string> = {
    md: "text/markdown; charset=utf-8",
    json: "application/json; charset=utf-8",
};

export function skillFileResponse(id: SkillId, path: string[]): Response {
    const file = skillFiles(id).find((f) => f.path === path.join("/"));
    if (!file) {
        return new Response("Not found", { status: 404 });
    }
    const type = TYPES[file.path.split(".").pop()!] ?? "text/plain; charset=utf-8";
    return new Response(file.content, { headers: { "Content-Type": type } });
}
