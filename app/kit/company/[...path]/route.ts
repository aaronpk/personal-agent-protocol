import { skillFileResponse, skillParams } from "../../../../lib/kit/serve";

export const dynamic = "force-static";
export const dynamicParams = false;

// The implement-personal-agent-protocol skill's files, for agents that read a skill from a URL.
export function generateStaticParams() {
    return skillParams("company");
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
    return skillFileResponse("company", (await params).path);
}
