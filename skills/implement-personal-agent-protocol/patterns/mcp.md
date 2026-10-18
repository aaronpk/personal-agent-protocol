# Pattern: MCP

A listed MCP server uses Streamable HTTP and MCP 2025-06-18 or later, accepts Session Tokens as its
access tokens, accepts only tokens issued for its `url`, enforces their scopes, and publishes RFC
9728 protected resource metadata whose `authorization_servers` includes `auth.issuer`
([section 6](https://personalagentprotocol.org/docs/0.2/spec#apis)). MCP uses Bearer tokens, not DPoP
([4.3](https://personalagentprotocol.org/docs/0.2/spec#sending-tokens)).

## A. The existing MCP server accepts Session Tokens

Point the server's token validation at the Poppy issuer, and check the token's `resource` (audience)
is the server's `url`.

- Fits: an existing MCP server that already does MCP authorization.
- Needs: the token endpoint issues Bearer Session Tokens for a request without `DPoP` and with
  `resource` set to the server's `url` (4.3). Token validation that can read the token's scopes,
  `resource`, and Session.
- Watch for: accepting tokens for any audience. Each Bearer token must work at only one MCP server.

## B. An MCP server in front of existing APIs

A new MCP server whose tools call the existing APIs with the verified identity.

- Fits: Companies with APIs but no MCP server.
- Watch for: the tools' calls to existing APIs must not allow more than the Session Token does
  ([guides](https://personalagentprotocol.org/docs/0.2/guides#company-internal)).

## What to watch for

- Bearer Session Tokens are accepted only on MCP APIs (4.3). A gateway that accepts them anywhere
  else defeats DPoP.
- MCP clients that don't implement Poppy can sign in through MCP's own authorization flow. The
  Company treats that as a new signed-in Session with no User ID, which ends when the sign-in is
  revoked or expires (section 6).
- `extension_required` from an MCP server refuses the Personal Agent entirely, never one tool
  (section 6).
- Tools check scopes on every call (`patterns/scopes.md`).
