import type { SceneArt } from "../art/art-files.ts";

export type Flow = {
  key: string;
  hour: string;
  label: string;
  title: string;
  sub: string;
  steps: readonly (readonly [scene: SceneArt, title: string, body: string])[];
};

/** Alice, Bob and Charlie's vault, Treasury, through its four kinds of moment. */
export const flows: readonly Flow[] = [
  {
    key: "founding",
    hour: "12:20 pm",
    label: "A · Founding",
    title: "Alice, Bob and Charlie found Treasury.",
    sub: "Their keepers generate the vault’s viewing key together. No one ever holds all of it.",
    steps: [
      [
        "lobby",
        "Open a lobby",
        "Alice names the vault and chooses how many approvals it takes to spend and how many keepers it takes to read.",
      ],
      [
        "invite",
        "Invite",
        "Bob and Charlie join with her invite. It holds no secrets, so any channel works.",
      ],
      [
        "key-generation",
        "Generate the key together",
        "Every keeper takes part in one key generation. Nobody ever holds the whole viewing key.",
      ],
      [
        "vault-founded",
        "Founded",
        "The vault is deployed and checked on chain: an ordinary Aztec address no single member can read.",
      ],
    ],
  },
  {
    key: "payment",
    hour: "2:10 pm",
    label: "B · A payment",
    title: "Paying an audit deposit.",
    sub: "Payments are proposals. Each member’s own device rebuilds and checks the transaction before they sign.",
    steps: [
      [
        "new-proposal",
        "Propose",
        "Charlie proposes 250 USDC to dave, memo “Audit deposit”, expiring tomorrow.",
      ],
      [
        "review",
        "Check",
        "Alice’s own device rebuilds the transaction and shows the checks and the exact message she signs.",
      ],
      ["ready", "Approve", "Alice and Bob approve. That’s enough: the proposal is ready."],
      [
        "executed",
        "Prove and send",
        "Any member executes. The proof checks the approvals; the chain sees nothing else.",
      ],
    ],
  },
  {
    key: "reading",
    hour: "4:30 pm",
    label: "C · Reading",
    title: "Seeing the balance.",
    sub: "Every viewing operation on Aztec is one multiplication by the vault’s secret. That splits, so each keeper returns a part with a proof and enough parts combine.",
    steps: [
      ["peers", "Ask", "Bob’s app asks the members’ keepers, through relays, to help decrypt."],
      [
        "keeper",
        "Answer",
        "Each keeper returns its part with a proof, and writes the request to its audit log.",
      ],
      [
        "health-good",
        "Combine",
        "Enough answers combine on Bob’s machine. The viewing key itself is never assembled.",
      ],
      ["balances", "See", "The balance and history appear, for members only."],
    ],
  },
  {
    key: "membership",
    hour: "6:05 pm",
    label: "D · A membership change",
    title: "Charlie leaves Treasury.",
    sub: "The members who stay deal fresh shares of the same key. The contract checks the new committee before it takes over.",
    steps: [
      ["share-plan", "Plan", "Alice removes Charlie and keeps both thresholds as they are."],
      [
        "reshare",
        "Reshare",
        "Alice and Bob deal fresh shares of the same key. Charlie’s share is replaced.",
      ],
      ["collecting", "Approve", "The change is a proposal, approved like any payment."],
      [
        "new-committee",
        "Activate",
        "The contract checks the new committee and switches to it. Same address, same funds.",
      ],
    ],
  },
];
