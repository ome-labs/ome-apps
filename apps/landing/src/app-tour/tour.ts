import type { ScreenId } from "../screens/app-screen.tsx";

export type TourStop = {
  tab: string;
  /** The app screen it shows, or the planned phone app. */
  screen: ScreenId | "phone";
  soon?: boolean;
  points: readonly (readonly [title: string, body: string])[];
};

/** The home page's tour of the app, a tab per part of a vault, four points each. */
export const tour: readonly [TourStop, ...TourStop[]] = [
  {
    tab: "Vaults",
    screen: "overview",
    points: [
      [
        "Found it together",
        "Every member’s keeper joins one key generation. The vault gets an ordinary Aztec address.",
      ],
      [
        "Nobody holds the key",
        "The viewing key is split across members and never assembled: not by a member, a server or us.",
      ],
      [
        "Two thresholds",
        "Choose how many approvals it takes to spend, and how many keepers it takes to read.",
      ],
      [
        "Health at a glance",
        "The overview tells you whether the vault can still read, and how much margin is left.",
      ],
    ],
  },
  {
    tab: "Payments",
    screen: "review",
    points: [
      ["Propose", "Any member proposes a payment with a memo and an expiry."],
      [
        "Check it yourself",
        "Each member’s own device rebuilds the transaction and shows exactly what they sign.",
      ],
      [
        "Approve",
        "Once enough members approve, any member executes. Nobody has to be online together.",
      ],
      ["Prove", "The chain sees a proof. Not who signed, how many had to, or how much moved."],
    ],
  },
  {
    tab: "Members",
    screen: "members",
    points: [
      ["Add or remove", "Change who is in the vault at any time, approved like any payment."],
      ["Same address", "The key is reshared among the new group. Funds never move."],
      [
        "Checked on chain",
        "The contract only accepts a committee whose shares match the vault’s key, verified in Noir.",
      ],
      ["Removed means removed", "A removed member’s share no longer combines with anything."],
    ],
  },
  {
    tab: "Keepers",
    screen: "audit",
    points: [
      [
        "One per member",
        "Your keeper holds your share of the viewing key and answers read requests.",
      ],
      ["Run it anywhere", "Your laptop, or a home server that stays awake."],
      [
        "Relays in between",
        "Relays forward encrypted traffic and keep sealed mailboxes for 7 days.",
      ],
      ["On the record", "Every request a keeper answers lands in its audit log, right in the app."],
    ],
  },
  {
    tab: "Phone",
    screen: "phone",
    soon: true,
    points: [
      ["Coming soon", "A phone app that holds your signing key and approves from anywhere."],
      [
        "Never your share",
        "Phones sign. Keepers stay awake. Your viewing share stays on your keeper.",
      ],
      ["Wait in a mailbox", "Proposals wait for you at the relay until you’re back."],
      ["Same checks", "Your phone rebuilds what you sign, just like the desktop app."],
    ],
  },
];
