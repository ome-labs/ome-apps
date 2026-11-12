/** The questions people ask, with the short answers. The home page shows them and lists them for search. */
export const faq = [
  {
    question: "Is it audited?",
    answer:
      "Not yet. Ome launches on Aztec testnet first and stays off mainnet until an external audit is done.",
  },
  {
    question: "What does the relay see?",
    answer:
      "Ciphertext and peer ids. It forwards keeper traffic and holds sealed mailboxes. Never a share, a key or a balance.",
  },
  {
    question: "What if keepers are offline?",
    answer:
      "Approvals still collect while people are offline. Reading needs enough keepers, so pick that number with your team’s uptime in mind. Vault health in the app shows the margin.",
  },
  {
    question: "What if I lose my device?",
    answer:
      "Shares are never backed up, by design. The other members rotate you out while enough keepers still answer, then add you back.",
  },
  {
    question: "Who pays fees?",
    answer:
      "Never the vault in public. Ome pays through a fee-paying contract, so the vault’s balance and members stay private.",
  },
  {
    question: "Why not just use a Safe?",
    answer:
      "Safe is great when your treasury can be public. Ome is for when it can’t: balances, payments and even who the signers are stay private.",
  },
] as const;
