import { skillZipResponse } from "../../../lib/kit/serve";

export const dynamic = "force-static";

// The poppy-review skill as a zip of its folder, for Claude apps and manual installs.
export function GET() {
    return skillZipResponse("review");
}
