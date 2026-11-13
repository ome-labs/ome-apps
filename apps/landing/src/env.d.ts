/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog's project token (public by design); set in Vercel. Without it the site sends nothing. */
  readonly VITE_POSTHOG_TOKEN?: string;
  /** Vercel's VERCEL_ENV at build time: "production", "preview" or "development". */
  readonly VITE_VERCEL_ENV: string;
  /** The short commit the build came from, on every event as site_version. */
  readonly VITE_SITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
