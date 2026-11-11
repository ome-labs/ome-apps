// The renderer in a plain browser on the sample data (`pnpm --filter @ome-labs/desktop browser`). `?scenario=` picks the
// starting scenario, and the switcher in the corner changes it, as `window.ome.dev.set` does in the app.
import { SCENARIOS, type Scenario, isScenario } from "../main/ome/fixtures/scenarios.ts";
import { fixtureBridge } from "./bridge.ts";

const asked = new URLSearchParams(location.search).get("scenario");
const scenario: Scenario = isScenario(asked) ? asked : "normal";
const { bridge, session } = fixtureBridge(scenario);
window.ome = bridge;

function switcher(): HTMLElement {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Fixture scenario");
  select.style.cssText =
    "position:fixed;right:12px;bottom:12px;z-index:9999;font:12px ui-monospace,monospace;padding:6px 8px;" +
    "border-radius:8px;border:1px solid #c9ccd6;background:#fff;color:#1b1e28;box-shadow:0 2px 8px #0002";
  for (const name of SCENARIOS) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = `scenario: ${name}`;
    option.selected = name === scenario;
    select.append(option);
  }
  select.addEventListener("change", () => {
    if (!isScenario(select.value)) return;
    session.setScenario(select.value);
    const url = new URL(location.href);
    url.searchParams.set("scenario", select.value);
    history.replaceState(null, "", url);
  });
  return select;
}

document.body.append(switcher());
await import("../renderer/main.tsx");
