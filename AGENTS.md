# Personal Agent Protocol site

## The docs

The docs pages are MDX files in `content/`. Before changing them, read
[`content/AGENTS.md`](content/AGENTS.md): where each page lives, how to write them, the changelog
entry each change to the draft needs, and how a version is published.

## The kit

`kit/company/` is the source of the Company implementation kit. `pnpm kit` generates `skills/` and
`.claude-plugin/` from it and the docs, adding the docs as Markdown and a checklist of every
requirement on the Company. Don't edit `skills/` by hand. After changing the docs or `kit/`, run
`pnpm kit` and commit what it writes. The build fails when the kit is out of date, when a spec JSON
example doesn't match its schema (`lib/kit/examples.ts`), when the kit links to a heading id that
doesn't exist, when a validator check's quote isn't in the docs word for word, or when the checklist
can't tell whether a new requirement applies to the Company (`lib/kit/checklist.ts`).

Run the validator's tests with `pnpm test:kit`.
