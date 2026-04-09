---
name: orderly-plugin-submit
description: Prepare and submit / publish an Orderly plugin to the Marketplace via `orderly submit`. Covers README generation (with user consent), required usagePrompt drafting and approval, manifest updates, and API submission. Use when the user wants to publish, release, upload, or submit a plugin to the Orderly Marketplace. Triggers on "submit plugin", "publish plugin", "release plugin", "marketplace", "upload plugin", "usagePrompt", "orderly submit", "plugin manifest".
---

# Orderly plugin — submit (Marketplace)

Guide the user through **documentation choices**, **mandatory `usagePrompt` with approval**, and **`orderly submit`** to the Marketplace API. Never submit without explicit user confirmation.

## When to use

- User wants to publish / submit a plugin to Orderly Marketplace, or to prepare `usagePrompt` / manifest for submission.

## Prerequisites

- **`orderly login`** — if not logged in, stop and instruct the user to run `orderly login` first.
- Plugin root with valid **`package.json`** `name` and Git **`origin`** remote (HTTPS `https://github.com/<owner>/<repo>`) or `.orderly-manifest.json` with `repoUrl`.
- Read [reference.md](reference.md) for integration concepts when drafting `usagePrompt`.

## Workflow (strict order)

### 1. Login

If CLI reports not authenticated, do not proceed until `orderly login` succeeds.

### 2. README — ask first (never auto-write by default)

Use **AskQuestion**: *Do you want to generate or update a Marketplace-style `README.md` in the plugin root?*

- **If yes** — generate content using a clear section outline (overview, install, usage, interceptors, development, license). Write or update `README.md` only after confirmation.
- **If no** — skip README. Do **not** overwrite an existing `README.md`.

Note: `orderly submit` does not upload README in the JSON body; README is for the GitHub repo. If the API adds a field later, update this skill.

### 3. usagePrompt — required, but user must approve

1. Draft **`usagePrompt`**: concise, actionable instructions for **integrating the plugin into a DEX / host app** (dependency, `plugins` array on `OrderlyAppProvider`, env vars, build order, pitfalls). Tone suitable for Marketplace / AI-assisted integration.
2. Enforce **max length 8192 characters** (same as CLI validation in `submit.js`).
3. **Show the full text** (or an explicit diff if updating) to the user and ask for **confirmation or edits**. Repeat until the user approves.
4. Only after approval, merge into **`.orderly-manifest.json`**:

   ```json
   {
     "usagePrompt": "<approved text>",
     "updatedAt": "<ISO timestamp>"
   }
   ```

   Preserve existing manifest fields (`npmName`, `pluginId`, `repoUrl`, `tags`, etc.). If no manifest exists, create `.orderly-manifest.json` consistent with `orderly create plugin` output and CLI resolver expectations.

### 4. Validate — dry run

Run from the plugin directory:

```bash
orderly submit --path . --dry-run
```

Show the printed payload summary to the user. Fix validation errors (npm name, GitHub URL, `pluginId` pattern, tag whitelist, `usagePrompt` length, etc.) before continuing.

**Valid tags** (comma-separated for `--tags`): `UI`, `Indicator`, `Order Entry`, `Trading`, `Chart`, `Portfolio`, `Analytics`, `Tool`, `Widget` — at most **5** tags.

### 5. Final confirmation before API

Use **AskQuestion**: *Submit this plugin to the Marketplace API now?*

- **If no** — stop; do not run submit without `--dry-run`.
- **If yes** — run:

```bash
orderly submit --path . [--tags "UI,Trading"] [--storybook-url "https://..."]
```

## After submit

Report HTTP outcome (success / validation error / auth). On success, mention review status if returned by the API.

## Related skills

- **orderly-plugin-create** — scaffold the package.
- **orderly-plugin-add** — wire the plugin into a host codebase (code changes).

## Reference

[reference.md](reference.md)
