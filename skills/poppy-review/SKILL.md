---
name: poppy-review
description: Review the Personal Agent Protocol (Poppy) docs, draft 0.1, and write feedback for their authors, organized by section. Use when asked to review, critique, or give feedback on Personal Agent Protocol, Poppy, or its specification, extensions, or guides.
---

# Reviewing the Personal Agent Protocol docs

The `reference/` folder holds the Personal Agent Protocol docs, draft 0.1, as Markdown. They're
published at https://personalagentprotocol.org, where they may be newer. You've been asked to review them. The people
working on the draft will read your review, so write it for them.

## What to do

1. Read the docs in `reference/`, or the ones you were asked to focus on.
2. If there's a `comments.md` next to this file, read it. It has comments people already left
   on the docs. Respond to them where you have something to add, and don't repeat them.
3. Write your review as one Markdown file, in the format below. Save it as `review.md` in the
   current folder, or reply with it if you can't save files.
4. Tell the person you're working with to share the review by opening a GitHub issue at
   https://github.com/personal-agent-protocol/personal-agent-protocol/issues/new?template=1-feedback.yml and pasting in `review.md`. Feedback is licensed under
   the contribution terms at https://personalagentprotocol.org/license/contributions.

Don't edit the docs. Comment on them. If you're implementing the protocol rather than reviewing it,
use the `implement-personal-agent-protocol` skill instead: it collects feedback as you build.

## What the authors most want feedback on

- Privacy and security.
- Gaps in the spec: something an implementation needs that the draft doesn't cover, or something
  that doesn't work as written.
- Simplification: parts that could be simpler without losing what they make possible.
- Broadly useful extensions: things many implementations need, such as payments, that could be
  built as extensions.

For each point, say what's wrong and why it matters, and suggest a fix when you have one. Put the
most important points first within each section. Skip praise and nitpicks unless asked.

## Review format

Group your points by the section they're about, using the section names and ids from the list
below. Points that span several sections go under "General". Quote the docs only when it makes a
point clearer, and keep quotes short.

```markdown
# Review of the Personal Agent Protocol docs (draft 0.1)

## Summary

Two or three sentences on the most important issues.

## General

- **Gap:** ...

## Specification › 3.1 Fields (`spec#fields`)

- **Ambiguous:** "A newer minor version doesn't break older Personal Agents" doesn't say what an
  agent does with a field it doesn't recognize. Suggest pointing to the rule in 3.3.
- **Question:** Is `protocol_version` required on every response, or only in discovery?
```

Label each point **Gap**, **Ambiguous**, **Contradiction**, **Risk**, **Simplification**,
**Wording**, or **Question**. In headings, name the page and section, then the page's file name
without `.md` and the section id, as in `spec#fields`.

## The pages and their sections

- `reference/introduction.md`: Personal Agent Protocol: Introduction
  - What is it? (`what`)
  - Why does it exist? (`why`)
  - Principles (`principles`)
- `reference/spec.md`: Personal Agent Protocol specification (draft)
  - 1. Introduction (`intro`)
  - 2. Terms (`terms`)
  - 3. Discovery (`discovery`)
  - 3.1 Fields (`fields`)
  - 3.2 OAuth server (`oauth-server`)
  - 3.3 Extensions (`extensions`)
  - 4. Sessions and authorization (`sessions`)
  - 4.1 Agent identity (`agent-identity`)
  - 4.2 Starting a Session (`starting-sessions`)
  - 4.3 Using Session Tokens (`sending-tokens`)
  - 4.4 Signing in (`sign-in`)
  - 4.5 Direct Sign-In (`direct-sign-in`)
  - 4.6 Device Sign-In (`device-sign-in`)
  - 4.7 Mediated Sign-In (`mediated-sign-in`)
  - 4.8 Account Tokens (`account-tokens`)
  - 4.9 Signing out (`sign-out`)
  - 5. Web browsing (`web-browsing`)
  - 6. APIs (`apis`)
  - 7. Conversations (`conversations`)
  - 7.1 Conversation protocols (`conversation-protocols`)
  - 7.2 Requests (`conversation-requests`)
  - 7.3 Sending messages (`sending-messages`)
  - 7.4 Message fields (`message-fields`)
  - 7.5 Reading events (`reading-events`)
  - 7.6 Streaming (`streaming`)
  - 7.7 Status and responder (`status`)
  - 7.8 Human or AI (`human-or-ai`)
  - 7.9 Handoff to a person (`handoff`)
  - 7.10 Direct Conversations (`direct-conversations`)
  - 7.11 Sign-in during a conversation (`conversation-sign-in`)
  - 7.12 Closing (`closing`)
  - 7.13 Errors (`conversation-errors`)
  - 8. Security considerations (`security`)
  - 8.1 Content from Companies (`untrusted-content`)
  - 8.2 Secrets and the model (`secrets`)
  - 8.3 What a domain vouches for (`trust`)
  - 8.4 Assertions (`assertion-audience`)
  - 9. References (`references`)
- `reference/extensions.md`: Personal Agent Protocol: Extensions
  - What extensions are (`about`)
  - How they work (`how`)
  - Extensions (`list`)
- `reference/operations.md`: Personal Agent Protocol: Operations extension
  - 1. Introduction (`intro`)
  - 2. Advertising support (`support`)
  - 3. Operations (`operations`)
  - 3.1 Revisions (`revisions`)
  - 3.2 Who can use an operation (`ownership`)
  - 4. Proposing an operation (`proposing`)
  - 4.1 OpenAPI (`binding-openapi`)
  - 4.2 MCP (`binding-mcp`)
  - 4.3 Conversations (`binding-conversations`)
  - 4.4 Websites (`binding-web`)
  - 5. Confirming an operation (`confirming`)
  - 5.1 Getting the User's approval (`approval`)
  - 5.2 Confirming (`confirm`)
  - 6. Tracking and recovery (`tracking`)
  - 7. Cancelling (`cancelling`)
  - 8. What a confirmation proves (`proof`)
  - 9. Errors (`errors`)
- `reference/guides.md`: Personal Agent Protocol: Guides
  - About the guides (`about`)
  - For both parties (`both`)
  - For personal agents (`agents`)
  - For companies (`companies`)
  - For the Operations extension (`operations`)
- `reference/path-to-1.md`: Personal Agent Protocol: Path to 1.0
  - How we get there (`process`)
  - Feedback requested (`feedback`)
  - Open topics (`open-topics`)
  - Design partners (`partners`)
