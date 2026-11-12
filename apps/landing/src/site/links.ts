// Where the site points outside itself. One place, so a moved repo or handle is one edit.

export const links = {
  github: "https://github.com/ome-labs",
  repo: "https://github.com/ome-labs/ome",
  // Vulnerabilities go to GitHub's private advisories, never a public issue.
  advisories: "https://github.com/ome-labs/ome/security/advisories/new",
  x: "https://x.com/ome_labs",
  xHandle: "@ome_labs",
  research: "https://forum.aztec.network/t/on-an-aztec-multisig/8280",
  aztecForum: "https://forum.aztec.network",
} as const;

/** The one-line install, as the CLI's install script will be served. */
export const installCommand = "curl -fsSL https://ome.network/install.sh | sh";
