# Orderly plugin — create (CLI) reference

CLI scaffolding reference. For plugin development patterns, see **[orderly-plugin-write](../orderly-plugin-write/SKILL.md)**.

## Naming Conventions

### Plugin Name (`--name`)

- Format: **PascalCase** (e.g., `BuySellButtons`, `MyPlugin`)
- Validation regex: `/^[A-Z][A-Za-z0-9]*$/`
- First character must be uppercase letter (A-Z), followed by letters or digits
- CLI will prompt again if invalid

### Plugin ID (`--id`)

- Format: kebab-case or custom (alphanumeric with hyphens)
- Validation regex: `/^[a-zA-Z][a-zA-Z0-9-]*$/`
- First character must be a letter (A-Z or a-z), followed by letters, digits, or hyphens
- Default: `toKebabCase(pluginName)` if not provided
- Must be globally unique (used in `registerPlugin({ id: '...' })`)
- CLI will prompt again if invalid

### NPM Package Name Derivation

CLI auto-generates npm-compliant package name:

- If `pluginId` matches npm naming rules, use it as npmName
- Otherwise, fallback to `toKebabCase(pluginName)`
- NPM rules:
  - Scoped: `@[a-z0-9][a-z0-9-._]*/[a-z0-9][a-z0-9-._]*`
  - Unscoped: `[a-z0-9][a-z0-9-._]*`

### Template Variables

These are derived internally by the CLI — not passed as flags:

| Variable | Format | Example |
|----------|--------|---------|
| `pluginName` | PascalCase | `BuySellButtons` |
| `pluginId` | kebab-case or custom | `buy-sell-buttons` |
| `npmName` | kebab-case | `buy-sell-buttons` |
| `pluginIdCamel` | camelCase | `buySellButtons` |
| `version` | Semver | `1.0.0` |

## Generated Plugin Structure

```
<plugin-id>/
├── index.tsx          # Entry point, exports registration function
├── plugin.tsx        # registerXxxPlugin() with interceptors and setup
├── components/        # UI components for interceptors
├── types/             # Plugin options and prop types
├── .orderly-manifest.json  # Plugin metadata
└── package.json
```

## Interceptor Targets (`--interceptor`)

Valid values for `orderly create plugin --interceptor`:

| Target | UI surface |
|--------|------------|
| `Trading.Layout.Desktop` | Desktop trading shell |
| `Trading.Layout.Mobile` | Mobile trading shell |
| `OrderBook.Desktop.Asks` | Ask side order book |
| `OrderBook.Desktop.Bids` | Bid side order book |
| `OrderBook.Desktop.MarkPrice` | Mark price row |
| `Trading.PositionHeader` | Position header |
| `Trading.DataList` | Positions / orders tables |
| `Deposit.DepositForm` | Deposit form |
| `Deposit.WithdrawForm` | Withdraw form |
| `Account.AccountMenu` | Account menu |
| `Layout.MainMenus` | Main navigation |
| `Table.EmptyDataIdentifier` | Empty table state |

> Keep this list in sync with `@orderly.network/cli` constants when updated.
> Use the **Inspector tool** in dev mode to discover all available target paths.
