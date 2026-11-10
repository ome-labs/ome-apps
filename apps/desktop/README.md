# Ome desktop

The desktop app for Ome members: their vaults, proposals and keeper, as a client of the member's daemon (`omed`). Built
with Electron, React, TanStack Router and Query, and Tailwind.

The pages are placeholders for now. Each names its section of the UI guide, the daemon methods it uses and shows the
data its main method returns. They become real screens as `@ome-labs/ui-web` lands.

## Run it

```sh
pnpm --filter @ome-labs/desktop dev          # the app with hot reload, on fixtures
pnpm --filter @ome-labs/desktop test         # unit tests (fast; what CI runs)
pnpm --filter @ome-labs/desktop test:smoke   # builds and launches the app with Playwright (local only)
pnpm --filter @ome-labs/desktop package      # an unsigned app in release/ for this platform
```

`OME_DESKTOP_SCENARIO=<scenario>` starts on a scenario; in development the panel at the bottom right switches it.

## Fixtures

Until the daemon client exists, the app runs on `src/main/ome/fixtures/`: the UI guide's sample data (Alice, Bob and
Carol's Treasury vault, the OMET test token, proposals `3eb2`, `335c` and `868c`). Scenarios:

| Scenario           | Shows                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `normal`           | everything working, signer locked                                     |
| `no-profile`       | first run                                                             |
| `no-vaults`        | a profile with no vault yet                                           |
| `locked`           | the signer can't be unlocked (it stays locked)                        |
| `node-unreachable` | the Aztec node can't be reached                                       |
| `syncing`          | the wallet is behind the node                                         |
| `keeper-failed`    | the keeper stopped; peers look offline                                |
| `alarm`            | the vault's on-chain config names a committee the keeper can't verify |

Reads are simulated; the signer unlocks with any passphrase except `wrong`. Other writes fail with "the fixtures don't
simulate … yet" until a screen needs them.

## How it fits together

```text
renderer (React)  ──window.ome.call──▶  preload  ──ipc "ome:call"──▶  main  ──▶  OmeClient (fixtures | daemon)
                  ◀──window.ome.onEvent──────────────── "ome:event" ◀──────────  events
```

- **`src/shared/contract.ts`**: the methods the renderer may call (every daemon method except the session handshake,
  the event stream and stopping the daemon), checked at runtime; errors cross the boundary with their kind.
- **`src/main`**: window, security, the `app://` protocol, IPC, and the client. The real daemon client (socket, token,
  events) will live in `src/main/ome/daemon/`, so the renderer never changes when it lands.
- **`src/preload`**: exposes `window.ome` and nothing else.
- **`src/renderer`**: routes from the UI guide's site map (`routes/pages.ts`), queries kept fresh by daemon events.

## Security

- Every window is sandboxed and context-isolated, without Node integration.
- The renderer is served from `app://ome/` with a strict Content Security Policy: no inline or remote scripts, no
  remote connections.
- Navigation away from the app, new windows and webviews are blocked; `https` links open in the browser.
- Every permission request is refused.
- IPC accepts calls only from the app's own page, and only allowlisted methods.

## Not built yet

The daemon client, bundling `omed` and `ome-keeper`, Touch ID, code signing and notarization, auto-update, and the
release workflow.
