# Orderly plugin — develop reference

## Interceptor Targets

Valid target paths for interceptors. Keep in sync with `@orderly.network/cli` constants.

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
| `Trading.OrderEntry.TypeTabs` | Limit / Market / Advanced order type tabs | Customize button text, layout, add hints |
| `Trading.OrderEntry.BuySellSwitch` | Buy / Sell toggle area | Replace with custom switcher, add risk controls |
| `Trading.OrderEntry.Available` | Available balance row | Extend balance info, insert guidance entry |
| `Trading.OrderEntry.QuantitySlider` | Quantity slider and Max buy/sell area | Custom steps, add quick percentage buttons |
| `Trading.OrderEntry.SubmitSection` | Submit button + estimated liq price / slippage / fee area | Wrap submission logic, replace submit area UI |

Use the **Inspector tool** in dev mode to discover all available target paths.
