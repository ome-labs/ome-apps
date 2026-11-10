// Where each asset lives inside assets/, relative to it. Export, generate and the manifest test
// share these so the layout is defined once.
export const illustrationFile = (group: string, id: string, scale: "1x" | "2x") =>
  `illustrations/${group}/${id}@${scale}.webp`;
export const textureFile = (id: string, scale: "1x" | "2x") => `textures/${id}@${scale}.webp`;
export const objectFile = (group: string, id: string) => `objects/${group}/${id}.svg`;
export const sceneFile = (id: string, scale: "1x" | "2x") => `scenes/${id}@${scale}.webp`;
export const avatarFile = (kind: "vault" | "profile", id: string) => `avatars/${kind}s/${id}.svg`;
export const appIconVariants = ["lake", "night", "paper", "testnet"] as const;
export type AppIconVariant = (typeof appIconVariants)[number];
