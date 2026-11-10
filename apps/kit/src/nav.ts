import type { IconName } from "@ome-labs/icons/web";

export type NavItem = { to: string; title: string; description: string; icon: IconName };

/** The kit's pages, in the order the sidebar, the overview and search show them. */
export const nav = [
  {
    label: "Start",
    items: [
      {
        to: "/",
        title: "Overview",
        description: "What's in the kit and how to use it",
        icon: "home",
      },
    ],
  },
  {
    label: "Foundations",
    items: [
      {
        to: "/foundations/colour",
        title: "Colour",
        description: "Primitive scales, semantic roles, contrast",
        icon: "eye",
      },
      {
        to: "/foundations/typography",
        title: "Typography",
        description: "Three families and the 20 text styles",
        icon: "edit",
      },
      {
        to: "/foundations/depth",
        title: "Depth & spacing",
        description: "Shadows, radii, spacing and control heights",
        icon: "copy",
      },
      {
        to: "/foundations/motion",
        title: "Motion",
        description: "Durations, easings and reduced motion",
        icon: "play",
      },
    ],
  },
  {
    label: "Brand",
    items: [
      {
        to: "/brand/logo",
        title: "Logo & app icons",
        description: "Mark, wordmark, lockups and app icons",
        icon: "signature",
      },
      {
        to: "/brand/icons",
        title: "Icons",
        description: "The 86 interface icons under Ome names",
        icon: "grid",
      },
      {
        to: "/brand/illustrations",
        title: "Illustrations",
        description: "Pixel scenes from the lake, by flow",
        icon: "sun-water",
      },
      {
        to: "/brand/scenes",
        title: "Scenes",
        description: "In-app scenes, drawn after the onboarding ones",
        icon: "sun",
      },
      {
        to: "/brand/avatars",
        title: "Avatars",
        description: "Pixel avatars for vaults and profiles",
        icon: "user",
      },
      {
        to: "/brand/textures-objects",
        title: "Textures & objects",
        description: "Dither textures and 32-grid pixel objects",
        icon: "vault",
      },
    ],
  },
  {
    label: "Components",
    items: [
      {
        to: "/components/actions",
        title: "Actions",
        description: "Button and icon button",
        icon: "check",
      },
      {
        to: "/components/forms",
        title: "Forms",
        description: "Fields, select, checkbox, radio, switch",
        icon: "list",
      },
      {
        to: "/components/navigation",
        title: "Navigation",
        description: "Sidebar items, tabs, filter chips, keys",
        icon: "sidebar",
      },
      {
        to: "/components/status",
        title: "Status",
        description: "Status badges and tags",
        icon: "info",
      },
      {
        to: "/components/identity",
        title: "Identity",
        description: "Member avatars and token monograms",
        icon: "user",
      },
      {
        to: "/components/values",
        title: "Values",
        description: "Addresses, hashes and amounts",
        icon: "token",
      },
      {
        to: "/components/thresholds",
        title: "Thresholds",
        description: "Threshold chips, votes, reading health",
        icon: "committee",
      },
      {
        to: "/components/steps",
        title: "Steps",
        description: "Step rows for founding and execution",
        icon: "hourglass",
      },
      {
        to: "/components/review",
        title: "Review",
        description: "Check rows and the review panel",
        icon: "audit",
      },
      {
        to: "/components/codes",
        title: "Codes",
        description: "Code boxes and QR codes",
        icon: "qr",
      },
      {
        to: "/components/feedback",
        title: "Feedback",
        description: "Banners and toasts",
        icon: "bell",
      },
      {
        to: "/components/overlays",
        title: "Overlays",
        description: "Dialog, unlock, command menu, menu, tooltip",
        icon: "more-horizontal",
      },
      {
        to: "/components/data",
        title: "Data",
        description: "Proposal table and activity rows",
        icon: "proposals",
      },
      {
        to: "/components/surfaces",
        title: "Surfaces",
        description: "Cards, empty states, the dither dissolve",
        icon: "file",
      },
      {
        to: "/components/shell",
        title: "Shell",
        description: "App shell, top bar, sidebar, vault switcher",
        icon: "laptop",
      },
    ],
  },
] as const satisfies readonly { label: string; items: readonly NavItem[] }[];

export const navItems = nav.flatMap((section) =>
  section.items.map((item) => ({ ...item, group: section.label })),
);
