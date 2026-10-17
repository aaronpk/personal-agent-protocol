# Pattern: scopes

Scopes say what account access a sign-in grants
([4.4](https://personalagentprotocol.org/docs/spec#sign-in)). The protocol defines `poppy:read`
(view account information) and `poppy:write` (make changes). They're independent: `poppy:write`
doesn't include `poppy:read`. Companies decide which operations need each scope and enforce them on
the website, APIs, and actions the Company Agent performs (4.4).

## Mapping onto existing permissions

Write a table in the design that maps each Poppy scope to the Company's existing permissions:

| Scope         | Grants                                | Doesn't grant                                   |
| ------------- | ------------------------------------- | ----------------------------------------------- |
| `poppy:read`  | <existing read permissions, by name>  | <sensitive reads kept out, if any>              |
| `poppy:write` | <existing write permissions, by name> | <actions kept out, such as changing a password> |

- Start from what the Company already lets a signed-in customer do, and decide what a Personal Agent
  shouldn't do even with `poppy:write`, such as changing sign-in credentials or closing the
  account.
- Use custom scopes for access that needs separate consent, such as `addresses`. Describe each in
  `auth.custom_scopes`. Names starting with `poppy:` are reserved (4.4).
- A Company MAY leave out `poppy:read` and `poppy:write` and offer only narrower custom scopes
  (4.4).
- Decide which scopes each sign-in type can grant. Mediated Sign-In often grants less.

## One shared check

Put the scope check in one place that every channel calls: the website, APIs, MCP tools, the
Company Agent's tools, and live agents' tools
([guides](https://personalagentprotocol.org/docs/guides#company-scopes)).

- **A policy function or service** that takes the verified Session (`client_id`, account, scopes)
  and an action, and answers allow or deny with the missing scopes. Each channel turns a denial into
  its own error: `insufficient_scope` or `sign_in_required` in `WWW-Authenticate` for APIs
  ([section 6](https://personalagentprotocol.org/docs/spec#apis)), an `authorization` event in
  conversations ([7.11](https://personalagentprotocol.org/docs/spec#conversation-sign-in)), and a
  page or redirect on the website.
- **Existing permission checks, fed from scopes.** If services already check permissions, derive
  the permission set from the token's scopes at the edge, and let existing checks do the rest
  ([guides](https://personalagentprotocol.org/docs/guides#company-internal)).

## What to watch for

- The Company Agent's tools check scopes on every call. Don't rely on the model to decide
  ([guides](https://personalagentprotocol.org/docs/guides#company-scopes)).
- A live agent who takes over is held to the same scopes
  ([7.9](https://personalagentprotocol.org/docs/spec#handoff)). Their tools need the same check,
  which may mean changes to the live-agent desk.
- A message never authorizes an account action (7.11).
- The website applies the Session's scopes through the browser-session cookie
  ([section 5](https://personalagentprotocol.org/docs/spec#web-browsing)).
- Never grant beyond what was requested and allowed for the sign-in type (4.4).
