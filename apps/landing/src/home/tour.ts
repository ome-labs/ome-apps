import type { ScreenId } from "../app-preview/app-screen.tsx";

export type TourStop = {
  tab: string;
  /** The app screen it shows. */
  screen: ScreenId;
};

/** The home page's tour of the app, a tab per part of a vault. */
export const tour: readonly [TourStop, ...TourStop[]] = [
  {
    tab: "Vaults",
    screen: "overview",
  },
  {
    tab: "Payments",
    screen: "review",
  },
  {
    tab: "Members",
    screen: "members",
  },
  {
    tab: "Keepers",
    screen: "audit",
  },
];
