# Orderly Plugin Submit — Reference

Reference for preparing and submitting an Orderly plugin to the Marketplace. Use with **orderly-plugin-submit** skill.

## `.orderly-manifest.json` Fields

| Field | Required | Description |
|:------|:---------|:------------|
| `npmName` | Yes | npm package name (e.g. `@orderly.network/plugin-example`) |
| `pluginId` | Yes | Stable ID (kebab-case), must match `registerPlugin` call |
| `repoUrl` | Yes | HTTPS GitHub URL (e.g. `https://github.com/<owner>/<repo>`) |
| `usagePrompt` | Yes | Integration instructions (max 8192 chars) |
| `tags` | No | Marketplace tags (max 5) |
| `storybookUrl` | No | Storybook preview URL |
| `updatedAt` | Auto | ISO timestamp, set on each update |

## Valid Tags

Comma-separated list, max **5** tags:

| Tag | Use for |
|:----|:--------|
| `UI` | Visual components, UI overlays |
| `Indicator` | Chart indicators, price markers |
| `Order Entry` | Order forms, order management |
| `Trading` | Trading panels, position management |
| `Chart` | Chart modifications, drawing tools |
| `Portfolio` | Portfolio views, asset breakdown |
| `Analytics` | Data analysis, statistics |
| `Tool` | Utilities, helpers |
| `Widget` | Standalone widgets |

## `usagePrompt` Guidelines

`usagePrompt` is shown to AI assistants and developers integrating your plugin. It should explain **how to add the plugin to a host app**, not what the plugin does.

### Structure (recommended)

```
1. Install: <npm command or package info>
2. Register: <code snippet for OrderlyAppProvider plugins array>
3. Config: <env vars, options, prerequisites>
4. Build: <any build/setup steps>
5. Pitfalls: <common mistakes or注意点>
```

### Example

```markdown
Install: npm install @orderly.network/plugin-sample
Register:
  import registerSample from "@orderly.network/plugin-sample";
  <OrderlyAppProvider plugins={[registerSample()]} ...>
Config: Set RECOMMEND_API_URL env var to your endpoint.
Build: Run `pnpm build` before use.
Pitfalls: Do not mix with other order-type plugins.
```

### Rules

- Max **8192 characters** (CLI validates this)
- Be concise — AI will summarize
- Focus on **integration steps**, not features
- Use code snippets for `plugins` array

## Marketplace README Template

The README is for the GitHub repo, not uploaded to the API. Structure:

```markdown
# <Plugin Name>

<One-line description>

## Overview

<What it does, who it's for>

## Install

<npm install command>

## Usage

<Basic usage example with code>

## Configuration

<Options / env vars>

## Interceptors

| Target | Description |
|:-------|:------------|
| `Trading.Layout.Desktop` | <description> |

## Development

<Build/test commands>

## License
```

## Submit Command

```bash
# Dry run (validate only)
orderly submit --path . --dry-run

# Actual submit
orderly submit --path . [--tags "UI,Trading"] [--storybook-url "https://..."]
```

## Submit API Response

| Status | Meaning |
|:-------|:--------|
| `200` | Success — plugin submitted for review |
| `400` | Validation error — fix fields and retry |
| `401` | Not authenticated — run `orderly login` |

On success, the API may return a `reviewStatus` field indicating if immediate publish or pending review.
