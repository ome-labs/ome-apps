/** The questions people ask, with the short answers. The home page shows them and lists them for search. */
export const faq = [
  {
    question: "What is Ome?",
    answer:
      "A private multisig for Aztec. Your team shares one vault: enough members have to approve to spend from it, and enough members’ keepers have to answer to read it.",
  },
  {
    question: "How is it different from a Safe?",
    answer:
      "A Safe keeps its signers, its threshold and every payment on a public chain. Ome keeps them private: the chain sees a valid proof, not who signed, how many had to, or how much moved.",
  },
  {
    question: "What is a keeper?",
    answer:
      "A small program each member runs, on their laptop or a server that stays awake. It holds that member’s share of the vault’s viewing key and answers read requests with a proof, without ever handing the share over.",
  },
  {
    question: "Can Ome Labs see my vault?",
    answer:
      "No. We run a relay that forwards encrypted keeper traffic, so it sees ciphertext and peer ids. Never a share, a key or a balance.",
  },
  {
    question: "What happens when someone leaves?",
    answer:
      "The members who stay re-split the same viewing key among themselves and update the signers, approved like any payment. The vault keeps its address, funds don’t move, and the old share stops working.",
  },
  {
    question: "What if I lose my device?",
    answer:
      "Shares are never backed up, by design. While enough members remain, the others swap in your new key or rotate you out and back in. The app shows how much margin your vault has.",
  },
  {
    question: "Is it audited?",
    answer:
      "Not yet. Ome launches on Aztec testnet first and stays off mainnet until an external audit is done.",
  },
] as const;
