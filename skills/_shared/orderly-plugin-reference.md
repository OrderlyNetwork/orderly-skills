# Orderly Plugin Shared Reference

Canonical shared reference for Orderly plugin skills. Keep this file as the single source of truth for common constraints.

## Naming Conventions

### Plugin Name (`--name`)

- Format: PascalCase (for example `BuySellButtons`)
- Validation regex: `/^[A-Z][A-Za-z0-9]*$/`

### Plugin ID (`--id`, manifest, and `registerPlugin({ id })`)

Use the **Marketplace API** rule everywhere the string identifies the plugin (CLI flag, `.orderly-manifest.json` `pluginId`, and `SDK.registerPlugin({ id })` in `plugin.tsx`). Do not use a separate “runtime camelCase” regex.

- Format: letter first, then letters, digits, or hyphens (kebab-case is typical, e.g. `orderly-onramp`)
- Validation regex (aligned with server `PLUGIN_ID_REGEX`): `/^[a-zA-Z][a-zA-Z0-9-]*$/`
- Default when scaffolding: `toKebabCase(pluginName)` when `--id` omitted

## Interceptor Targets

Valid targets for `orderly-devkit create plugin --interceptor` and plugin interceptor registration.

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
| `Trading.OrderEntry.TypeTabs` | Limit / Market / Advanced order type tabs |
| `Trading.OrderEntry.BuySellSwitch` | Buy / Sell toggle area |
| `Trading.OrderEntry.Available` | Available balance row |
| `Trading.OrderEntry.QuantitySlider` | Quantity slider and Max buy/sell area |
| `Trading.OrderEntry.SubmitSection` | Submit button + estimated liq price / slippage / fee area |

Use the Inspector tool in dev mode to discover additional target paths. Keep this list in sync with `@orderly.network/cli` constants.

## Manifest Constraints

`.orderly-manifest.json` common fields:

- `npmName` (required)
- `pluginId` (required) — same pattern as API: `/^[a-zA-Z][a-zA-Z0-9-]*$/`
- `repoUrl` (required, HTTPS GitHub URL)
- `usagePrompt` (optional, max 8192 chars, recommended)
- `tags` (optional, max 5)
- `coverImages` (optional, max 10 absolute URLs or `/uploads/...` paths)
- `updatedAt` (ISO timestamp, refresh on updates)
