import type { PagePath } from "./pages.ts";

/** The header's pages, in order; Home is the logo and Install is the button. */
export const navItems: readonly { to: PagePath; label: string }[] = [
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/security", label: "Security" },
  { to: "/about", label: "About" },
];
