interface ImportMetaEnv {
  /** The kit's workspace packages, read from their package.json at build time (vite.config.ts). */
  readonly KIT_PACKAGES: { name: string; version: string; description: string }[];
}
