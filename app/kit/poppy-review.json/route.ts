import { skillKit } from "../../../lib/kit/serve";

export const dynamic = "force-static";

// The review skill's files, for the comments menu to zip with the reader's comments.
export function GET() {
    return Response.json(skillKit("review"));
}
