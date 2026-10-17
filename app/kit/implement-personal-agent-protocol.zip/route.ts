import { skillZipResponse } from "../../../lib/kit/serve";

export const dynamic = "force-static";

// The implement-personal-agent-protocol skill as a zip of its folder, for Claude apps and manual installs.
export function GET() {
    return skillZipResponse("company");
}
