import type { PostHog } from "posthog-js";

import type { AnalyticsEvent, AnalyticsEvents } from "./events.ts";

// PostHog, loaded only on the production site and only for visitors who haven't asked not to be counted. It runs
// cookieless with no person profiles: nothing is stored in the browser and no event is tied to a person. Calls
// made before it loads wait in a queue; when it never loads, they are dropped.

/** The managed reverse proxy in front of PostHog's US ingest, so the browser never talks to PostHog directly. */
const apiHost = "https://t.envoy1084.xyz";
const token = import.meta.env.VITE_POSTHOG_TOKEN;
const production = import.meta.env.VITE_VERCEL_ENV === "production";

/** Set by visiting any page with ?internal=1 (and cleared with ?internal=0), so the team's own visits aren't counted. */
const internalKey = "ome:analytics-internal";

type State = "idle" | "loading" | "ready" | "off";

let state: State = "idle";
let client: PostHog | undefined;
const queue: [string, Record<string, unknown>][] = [];

export function startAnalytics(): void {
  if (state !== "idle") return;

  if (!token || !production || declined()) {
    state = "off";
    queue.length = 0;
    return;
  }

  state = "loading";
  // After the page has painted and settled: analytics must never cost the visitor a frame.
  const load = () => void loadPostHog(token);
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 4000 });
  else setTimeout(load, 1500);
}

export function track<E extends AnalyticsEvent>(event: E, properties: AnalyticsEvents[E]): void {
  if (state === "off") return;

  // The URL is taken now, not when the queue drains, so an early page view keeps its own page and campaign.
  const withPage = { ...properties, $current_url: window.location.href };

  if (client) client.capture(event, withPage);
  else queue.push([event, withPage]);
}

async function loadPostHog(projectToken: string): Promise<void> {
  const { default: posthog } = await import("posthog-js");

  posthog.init(projectToken, {
    api_host: apiHost,
    ui_host: "https://us.posthog.com",
    cookieless_mode: "always",
    person_profiles: "never",
    respect_dnt: true,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true, network_timing: false },
    before_send: (event) => {
      if (event) event.properties.page_type = pageType(window.location.pathname);

      return event;
    },
  });
  posthog.register({ site_version: import.meta.env.VITE_SITE_VERSION, viewport: viewport() });

  client = posthog;
  state = "ready";
  for (const [event, properties] of queue.splice(0)) posthog.capture(event, properties);

  stripCampaignFromUrl();
}

/** Do Not Track, Global Privacy Control, or one of the team. */
function declined(): boolean {
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  if (gpc === true || navigator.doNotTrack === "1") return true;

  try {
    const flag = new URLSearchParams(window.location.search).get("internal");
    if (flag === "1") window.localStorage.setItem(internalKey, "1");
    if (flag === "0") window.localStorage.removeItem(internalKey);

    return window.localStorage.getItem(internalKey) === "1";
  } catch {
    // Storage can be blocked; then nobody is marked internal.
    return false;
  }
}

/** The page's kind, so reports can group pages without parsing paths. */
function pageType(path: string): string {
  const page = path.replace(/\/+$/, "") || "/";
  const known: Record<string, string> = {
    "/": "home",
    "/product": "product",
    "/how-it-works": "how_it_works",
    "/security": "security",
    "/about": "about",
    "/install": "install",
    "/privacy": "privacy",
    "/terms": "terms",
  };

  return known[page] ?? "not_found";
}

function viewport(): "phone" | "tablet" | "desktop" {
  const width = window.innerWidth;

  return width < 768 ? "phone" : width < 1024 ? "tablet" : "desktop";
}

/**
 * Once the landing page view has carried the campaign tags, take them out of the address bar, so a visitor who
 * copies the link doesn't pass someone else's campaign along. The router's own state is kept as it is.
 */
function stripCampaignFromUrl(): void {
  const url = new URL(window.location.href);
  const tags = [...url.searchParams.keys()].filter(
    (key) => key.startsWith("utm_") || key === "internal",
  );
  if (tags.length === 0) return;

  for (const key of tags) url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", url);
}
