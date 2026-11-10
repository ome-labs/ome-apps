// Every app icon file the brand package ships, by its path under `assets/app-icon/`.
const urls = import.meta.glob<string>("@brand-assets/app-icon/**/*.{svg,png}", {
  query: "?url",
  import: "default",
  eager: true,
});

export type AppIconFile = {
  path: string;
  name: string;
  folder: string;
  url: string;
  /** The pixel size in the file name (`lake-256.png`), when it has one. */
  size: number | undefined;
};

export const appIconFiles: AppIconFile[] = Object.entries(urls)
  .map(([key, url]) => {
    const path = key.slice(key.indexOf("app-icon/") + "app-icon/".length);
    const name = path.split("/").pop() ?? path;
    const size = Number(name.match(/-(\d+)\.png$/)?.[1]);

    return {
      path,
      name,
      folder: path.includes("/") ? (path.split("/")[0] ?? "") : "masters",
      url,
      size: Number.isFinite(size) ? size : undefined,
    };
  })
  .toSorted((a, b) => a.path.localeCompare(b.path, "en", { numeric: true }));

export const appIconVariants = ["lake", "night", "paper", "testnet"] as const;
