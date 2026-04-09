# orderly-skills

Agent skills for Orderly plugin workflows (create, submit to Marketplace, add to a DEX host).

## Skills

| Directory | `name` (frontmatter) | Purpose |
|-----------|----------------------|---------|
| [skills/orderly-plugin-create](skills/orderly-plugin-create) | `orderly-plugin-create` | `orderly create plugin` (CLI scaffold) |
| [skills/orderly-plugin-write](skills/orderly-plugin-write) | `orderly-plugin-write` | Write plugin code: interceptors, hooks, lifecycle, patterns |
| [skills/orderly-plugin-add](skills/orderly-plugin-add) | `orderly-plugin-add` | Wire plugin into host (`OrderlyAppProvider` / workspace) |
| [skills/orderly-plugin-submit](skills/orderly-plugin-submit) | `orderly-plugin-submit` | README (optional), `usagePrompt` + confirm, `orderly submit` |

Shared reference: [skills/_shared/orderly-plugin-reference.md](skills/_shared/orderly-plugin-reference.md).

## Install (Vercel [skills](https://github.com/vercel-labs/skills) CLI)

Replace `<owner/repo>` with this repository’s GitHub path.

**All four:**

```bash
npx skills add <owner/repo> \
  --skill orderly-plugin-create \
  --skill orderly-plugin-write \
  --skill orderly-plugin-add \
  --skill orderly-plugin-submit \
  -y
```

**One skill:**

```bash
npx skills add <owner/repo> --skill orderly-plugin-create -y
```

**Direct path to a skill folder** (monorepo-friendly):

```bash
npx skills add https://github.com/<owner>/<repo>/tree/main/skills/orderly-plugin-create
```

## CLI package

Skills assume [`@orderly.network/cli`](https://www.npmjs.com/package/@orderly.network/cli) (`orderly` binary) for create/submit flows.

## Legacy

`orderly-plugin-gen` was replaced by **orderly-plugin-create** + **orderly-plugin-write** + **orderly-plugin-add** + **orderly-plugin-submit**. Use the install commands above.
