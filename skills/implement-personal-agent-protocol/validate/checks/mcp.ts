// Milestone 2: listed MCP servers (sections 4.3 and 6): protected resource metadata, Bearer Session
// Tokens bound to each server's url, and DPoP tokens refused.

import { authedRequest, heldToken, sessionParams, tokenRequest } from "../agent.ts";
import { getFollowing, header, parseWwwAuthenticate, type Exchange } from "../http.ts";
import { formatSchemaErrors } from "../schema.ts";
import { check } from "../schemas.ts";
import { accepted as probeAccepted, findProbe } from "./resource.ts";
import { skipRest, type Context, type Detail, type HeldToken, type Recorder } from "./types.ts";

export const MCP_IDS = [
    "mcp.no-token",
    "mcp.metadata",
    "mcp.authorization-servers",
    "mcp.bearer-token",
    "mcp.bearer-accepted",
    "mcp.dpop-token-rejected",
    "mcp.other-resource-rejected",
    "mcp.bearer-elsewhere-rejected",
];

export const INITIALIZE = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "poppy-validator", version: "0.1" },
    },
};

const MCP_HEADERS = { Accept: "application/json, text/event-stream" };

// Whether an MCP response is a successful initialize result (JSON or SSE).
export function initializeOk(ex: Exchange): boolean {
    if (ex.status !== 200) return false;
    let json = ex.json as { result?: unknown } | undefined;
    if (!json && ex.body) {
        for (const line of ex.body.split("\n")) {
            if (!line.startsWith("data:")) continue;
            try {
                json = JSON.parse(line.slice(5).trim());
                break;
            } catch {
                // Not JSON.
            }
        }
    }
    return Boolean(json && typeof json === "object" && "result" in json);
}

export function protectedResourceMetadataUrl(url: string): string {
    const u = new URL(url);
    return `${u.origin}/.well-known/oauth-protected-resource${u.pathname.replace(/\/+$/, "")}`;
}

type Outcome = { status: "pass" | "fail" | "warn"; server: string; detail: Detail };

// Collects outcomes per check across servers, then records one result per check.
function aggregator(r: Recorder) {
    const outcomes: Record<string, Outcome[]> = {};
    return {
        add(id: string, status: Outcome["status"], server: string, detail: Detail = {}) {
            (outcomes[id] ??= []).push({ status, server, detail });
        },
        flush(multiple: boolean) {
            for (const [id, list] of Object.entries(outcomes)) {
                const bad = list.filter((o) => o.status !== "pass");
                if (bad.length === 0) {
                    r.pass(id, {
                        summary:
                            list
                                .map((o) => o.detail.summary)
                                .filter(Boolean)
                                .join("; ") || undefined,
                        notes: list.flatMap((o) => o.detail.notes ?? []),
                    });
                    continue;
                }
                const first = bad[0];
                const label = (o: Outcome, text?: string) =>
                    multiple && text ? `${o.server}: ${text}` : text;
                const detail: Detail = {
                    exchange: bad.flatMap((o) =>
                        o.detail.exchange
                            ? Array.isArray(o.detail.exchange)
                                ? o.detail.exchange
                                : [o.detail.exchange]
                            : [],
                    ),
                    got:
                        bad
                            .map((o) => label(o, o.detail.got))
                            .filter(Boolean)
                            .join("; ") || undefined,
                    sent:
                        bad
                            .map((o) => label(o, o.detail.sent))
                            .filter(Boolean)
                            .join("; ") || undefined,
                    expected: first.detail.expected,
                    cause: first.detail.cause,
                };
                if (bad.some((o) => o.status === "fail")) r.fail(id, detail);
                else r.warn(id, detail);
            }
        },
    };
}

export async function checkMcp(ctx: Context, r: Recorder): Promise<void> {
    const servers = (ctx.discovered.poppy?.apis ?? [])
        .filter((a) => a?.type === "mcp" && typeof a.url === "string")
        .map((a) => a.url!);
    if (servers.length === 0) {
        skipRest(r, MCP_IDS, "poppy.json lists no MCP servers.");
        return;
    }
    const issuer = ctx.discovered.poppy?.auth?.issuer;
    const agg = aggregator(r);
    const bearer: Record<string, HeldToken> = {};

    for (const url of servers) {
        // No token: 401 pointing at the protected resource metadata.
        const none = (
            await authedRequest(ctx, {
                method: "POST",
                url,
                body: INITIALIZE,
                proof: "none",
                headers: MCP_HEADERS,
                note: "MCP initialize with no token",
            })
        ).ex;
        const www = parseWwwAuthenticate(header(none, "www-authenticate"));
        if (none.status === 401 && www.params.resource_metadata)
            agg.add("mcp.no-token", "pass", url);
        else
            agg.add("mcp.no-token", "fail", url, {
                exchange: none,
                expected: '401 with WWW-Authenticate: Bearer resource_metadata="…"',
                cause:
                    none.status === 401
                        ? "MCP 2025-06-18 requires the 401 to name the protected resource metadata URL in WWW-Authenticate, so MCP clients can find the authorization server."
                        : "The MCP server should refuse requests without a token with 401.",
            });

        // Protected resource metadata.
        const prmUrl = www.params.resource_metadata ?? protectedResourceMetadataUrl(url);
        const prm = (
            await getFollowing(ctx.http, prmUrl, {
                max: 3,
                headers: { Accept: "application/json" },
            })
        ).final!;
        const doc = prm.json as { resource?: unknown; authorization_servers?: unknown } | undefined;
        if (prm.status !== 200 || !doc || typeof doc !== "object") {
            agg.add("mcp.metadata", "fail", url, {
                exchange: prm,
                expected: `200 with JSON metadata at ${prmUrl}`,
                cause: "Publish RFC 9728 protected resource metadata for the MCP server.",
            });
            agg.add("mcp.authorization-servers", "fail", url, {
                exchange: prm,
                got: "no metadata",
                expected: `authorization_servers including "${issuer}"`,
            });
        } else {
            const errors = check("protected-resource-metadata.schema.json", doc);
            if (errors.length || doc.resource !== url) {
                agg.add("mcp.metadata", "fail", url, {
                    exchange: prm,
                    got: [
                        ...formatSchemaErrors(errors),
                        doc.resource !== url ? `resource ${JSON.stringify(doc.resource)}` : "",
                    ]
                        .filter(Boolean)
                        .join("; "),
                    expected: `resource "${url}" and authorization_servers`,
                    cause: "RFC 9728 requires resource to equal the server's URL, which clients check before using the metadata.",
                });
            } else agg.add("mcp.metadata", "pass", url);
            const list = Array.isArray(doc.authorization_servers) ? doc.authorization_servers : [];
            if (issuer && list.includes(issuer)) agg.add("mcp.authorization-servers", "pass", url);
            else
                agg.add("mcp.authorization-servers", "fail", url, {
                    exchange: prm,
                    got: `authorization_servers ${JSON.stringify(doc.authorization_servers)}`,
                    expected: `authorization_servers including "${issuer}", exactly as auth.issuer`,
                    cause: "MCP clients get tokens from the listed authorization servers; list the Poppy issuer.",
                });
        }

        if (!ctx.session.token) continue;

        // A Bearer token for this server: the renewal request without DPoP, with resource.
        const tokenEx = (
            await tokenRequest(
                ctx,
                sessionParams(ctx, { session_id: ctx.session.token.sessionId, resource: url }),
                { proof: "none", note: `renewing the Session without DPoP, resource=${url}` },
            )
        ).ex;
        const token = heldToken(tokenEx, undefined, url);
        if (!token) {
            agg.add("mcp.bearer-token", "fail", url, {
                exchange: tokenEx,
                expected: "200 with a Bearer Session Token",
                cause: "The token endpoint should issue a Bearer token when the request has no DPoP proof and names an MCP server in resource.",
            });
            continue;
        }
        if (token.tokenType.toLowerCase() !== "bearer") {
            agg.add("mcp.bearer-token", "fail", url, {
                exchange: tokenEx,
                got: `token_type ${token.tokenType}`,
                expected: "token_type Bearer",
            });
        } else agg.add("mcp.bearer-token", "pass", url);
        bearer[url] = { ...token, tokenType: "Bearer" };

        const ok = (
            await authedRequest(ctx, {
                method: "POST",
                url,
                token: bearer[url],
                body: INITIALIZE,
                headers: MCP_HEADERS,
                note: "MCP initialize with the Bearer Session Token for this server",
            })
        ).ex;
        if (initializeOk(ok)) agg.add("mcp.bearer-accepted", "pass", url);
        else
            agg.add("mcp.bearer-accepted", "fail", url, {
                exchange: ok,
                expected: "200 with an initialize result",
                cause: "The MCP server should accept Session Tokens issued for its url as access tokens.",
            });

        const dpop = (
            await authedRequest(ctx, {
                method: "POST",
                url,
                token: ctx.session.token,
                body: INITIALIZE,
                headers: MCP_HEADERS,
                note: "MCP initialize with the general DPoP Session Token and a proof",
            })
        ).ex;
        if (initializeOk(dpop))
            agg.add("mcp.dpop-token-rejected", "fail", url, {
                exchange: dpop,
                got: "200, initialize succeeded",
                expected: "401",
                cause: "The MCP server accepts tokens that weren't issued for its url.",
            });
        else agg.add("mcp.dpop-token-rejected", "pass", url);
    }

    // A Bearer token for another resource.
    if (ctx.session.token) {
        for (const url of servers) {
            if (!bearer[url]) continue;
            const other = servers.find((s) => s !== url && bearer[s]);
            let token = other ? bearer[other] : undefined;
            if (!token) {
                const resource = `${new URL(url).origin}/poppy-validator-not-a-resource`;
                const ex = (
                    await tokenRequest(
                        ctx,
                        sessionParams(ctx, { session_id: ctx.session.token.sessionId, resource }),
                        {
                            proof: "none",
                            note: `a Bearer token for resource=${resource}, which isn't listed`,
                        },
                    )
                ).ex;
                const issued = heldToken(ex, undefined, resource);
                if (!issued) {
                    agg.add("mcp.other-resource-rejected", "pass", url, {
                        summary: "The token endpoint refused a token for an unlisted resource.",
                    });
                    continue;
                }
                token = { ...issued, tokenType: "Bearer" };
            }
            const ex = (
                await authedRequest(ctx, {
                    method: "POST",
                    url,
                    token,
                    body: INITIALIZE,
                    headers: MCP_HEADERS,
                    note: `MCP initialize with a Bearer token issued for ${token.resource}`,
                })
            ).ex;
            if (initializeOk(ex))
                agg.add("mcp.other-resource-rejected", "fail", url, {
                    exchange: ex,
                    got: "200, initialize succeeded",
                    expected: "401",
                    cause: "The MCP server doesn't check that the token was issued for its url (the token's audience).",
                });
            else agg.add("mcp.other-resource-rejected", "pass", url);
        }

        const probe = findProbe(ctx);
        const anyBearer = Object.values(bearer)[0];
        if (probe && anyBearer) {
            const ex = (
                await authedRequest(ctx, {
                    url: probe.url,
                    token: anyBearer,
                    note: `${probe.describe}, with the MCP Bearer token`,
                })
            ).ex;
            if (probeAccepted(probe, ex))
                agg.add("mcp.bearer-elsewhere-rejected", "fail", servers[0], {
                    exchange: ex,
                    expected: "401",
                    cause: "A Bearer token for the MCP server works at another endpoint. Accept Bearer tokens only on MCP servers.",
                });
            else agg.add("mcp.bearer-elsewhere-rejected", "pass", servers[0]);
        } else
            r.skip(
                "mcp.bearer-elsewhere-rejected",
                probe
                    ? "No Bearer token was issued."
                    : "No conversation endpoint or --probe URL to try it at.",
            );
    }
    agg.flush(servers.length > 1);
    const reason = ctx.identity
        ? "No Session Token (see session.start)."
        : (ctx.identityProblem ?? "No test Personal Agent.");
    skipRest(r, MCP_IDS, reason);
}
