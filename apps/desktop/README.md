# Ome desktop

The desktop app for Ome members: their vaults, proposals and keeper, as a client of the member's daemon (`omed`). Built
with Electron, React, TanStack Router and Query, and Tailwind.

The first run (welcome, profile, passphrase, Touch ID), the profile list and Settings are built and talk to a real
daemon. The other pages are empty frames that become screens one at a time.

Settings (⌘,) covers appearance, the profile, the signer (unlock window, Touch ID), the node (a new one must be on the
profile's network; the daemon restarts to use it), relays, proving, and under Advanced a keeper on the member's own
server, the fee payer and `aztec-wallet`. Proving and relays are read as the daemon starts, so the page offers a
restart after changing them.

## Run it

```sh
pnpm --filter @ome-labs/desktop dev          # the app with hot reload, on your daemon
OME_DESKTOP_SOURCE=fixtures pnpm --filter @ome-labs/desktop dev   # on the sample data instead
pnpm --filter @ome-labs/desktop test         # unit tests (fast; what CI runs)
pnpm --filter @ome-labs/desktop test:smoke   # builds and launches the app with Playwright (local only)
pnpm --filter @ome-labs/desktop package      # an unsigned app in release/ for this platform
```

## The daemon

The app runs each profile's daemon the way the `ome` CLI does, so both share it:

- **Profiles** live in `OME_HOME` (default `~/.ome`), one folder per member under `profiles/`. At launch the app opens
  the profile it opened last, or the only one; with several it asks, and with none it starts the first run.
- **Starting `omed`**: when a profile's daemon isn't running, the app starts it detached (it outlives the app) with its
  output in the profile's `daemon.log`. It looks for `OME_DAEMON`, then `<home>/bin/omed`, then, in development, the core
  checkout's `packages/daemon/src/omed.ts` run with Node 24 (`OME_CORE_DIR`, default `../ome` beside this repository).
  The keeper comes from `OME_KEEPER_BIN`, `<home>/bin/ome-keeper` or the checkout's `crates/target`.
- **Talking to it**: newline-delimited JSON-RPC on the profile's socket, authenticated with its token, with the event
  stream forwarded to the renderer. If the daemon goes away, the app starts it again.
- **The first run** does what `ome init` does: starts a daemon for the new member, points it at the node (restarting
  it when the URL changes), checks the node answers, then `profile.create` with the passphrase.

- **Touch ID** (macOS) works like the CLI's `ome signer touch-id on`, so turning it on in one turns it on for both: the
  signer's sealing key goes into the login keychain (service `ome.signer`, account the profile's folder) behind a
  Touch ID check, with a `touch-id` marker in the profile. The key moves only between the keychain and the daemon in
  the main process. The first run offers it as a last step, and the unlock sheet uses it when it's on.

A local network for trying it: `aztec start --local-network`, then choose "Local network" in the first run.

## Fixtures

With `OME_DESKTOP_SOURCE=fixtures` (the smoke test, and designing a screen without a daemon) the app runs on
`src/main/ome/fixtures/`: the UI guide's sample data (Alice, Bob and Carol's Treasury vault, the OMET test token,
proposals `3eb2`, `335c` and `868c`). `OME_DESKTOP_SCENARIO=<scenario>` starts on a scenario, and in development
`window.ome.dev.set({ scenario })` in the devtools console switches it. Scenarios:

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
| `removed`          | this member was removed from the vault                                |
| `daemon-down`      | the profile's daemon failed to start                                  |

Reads are simulated; the signer unlocks with any passphrase except `wrong`. Other writes fail with "the fixtures don't
simulate … yet" until a screen needs them.

## How it fits together

```text
renderer (React)  ──window.ome.call──▶  preload  ──ipc "ome:call"──▶  main  ──▶  AppSession (daemon | fixtures)
                  ◀──window.ome.onEvent──────────────── "ome:event" ◀──────────  events
                  ──window.ome.session──▶ open, setup, retry, leave; "ome:session:changed" back
```

- **`src/bridge/contract.ts`**: the methods the renderer may call (every daemon method except the session handshake,
  the event stream and stopping the daemon), checked at runtime; errors cross the boundary with their kind.
- **`src/main`**: window, security, the `app://` protocol, IPC, and the session. `src/main/ome/daemon/` finds, starts
  and talks to `omed`; `src/main/ome/fixtures/` stands in for it.
- **`src/preload`**: exposes `window.ome` and nothing else.
- **`src/renderer`**: the session gate (first run, profiles, starting, failed), the first run in `onboarding/`, and
  routes from the UI guide's site map (`routes/pages.ts`), queries kept fresh by daemon events.

## Security

- Every window is sandboxed and context-isolated, without Node integration.
- The renderer is served from `app://ome/` with a strict Content Security Policy: no inline or remote scripts, no
  remote connections.
- Navigation away from the app, new windows and webviews are blocked; `https` links open in the browser.
- Every permission request is refused.
- IPC accepts calls only from the app's own page, and only allowlisted methods.

## Not built yet

Bundling `omed` and `ome-keeper` (the app needs them installed, or the core checkout, and Node 24 on `PATH`), turning
Touch ID on or off from settings,
code signing and notarization, auto-update, and the release workflow.
