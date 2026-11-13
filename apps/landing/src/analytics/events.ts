// Every event the site sends, with its properties. Values come from fixed lists, never free text, so nothing a
// visitor types or reads can leave the page. The README's analytics section is the human copy of this list, and
// /privacy names the same events.

type Empty = Record<string, never>;

/** Where on the site a link sits: the header, the footer, or the section it's in ("closing", "faq"…). */
export type Placement = string;

export type OutboundTarget = "github" | "advisories" | "x" | "aztec_forum" | "other";

export type AnalyticsEvents = {
  $pageview: { $pathname: string };
  /** A section crossed the middle of the screen, once per page view. */
  section_viewed: { section: string };
  outbound_clicked: { target: OutboundTarget; placement: Placement; url: string };
  /** One of the site's own buttons to another page or place on the page. */
  cta_clicked: { label: string; placement: Placement; destination: string };
  install_command_copied: Empty;
  app_tour_tab_selected: { tab: string };
  privacy_view_switched: { view: "network" | "member" };
  reshare_stage_selected: { stage: string };
  payment_step_selected: { step: string };
  faq_opened: { question: string };
  flow_step_selected: { flow: string; step: number };
  menu_opened: Empty;
  not_found_viewed: { path: string };
};

export type AnalyticsEvent = keyof AnalyticsEvents;
