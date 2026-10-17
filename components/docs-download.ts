import type { SkillKit } from "../lib/kit/serve";
import { zip } from "../lib/zip";

// Downloads from the comments menu: comment files, and the review skill, which has the docs and
// instructions for an AI agent to review them.

const REVIEW_ZIP = "poppy-review.zip";

export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Downloads the review skill's zip. With comments, the zip is built in the browser from the same
// files as the zip the site serves, with the comments added as comments.md.
export async function downloadDocs(comments?: string) {
    if (!comments) {
        const link = document.createElement("a");
        link.href = `/kit/${REVIEW_ZIP}`;
        link.download = REVIEW_ZIP;
        link.click();
        return;
    }
    const response = await fetch("/kit/poppy-review.json");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const kit: SkillKit = await response.json();
    const files = [...kit.files, { path: kit.commentsPath, content: comments }];
    downloadBlob(
        new Blob([zip(files, new Date(kit.updated))], { type: "application/zip" }),
        REVIEW_ZIP,
    );
}
