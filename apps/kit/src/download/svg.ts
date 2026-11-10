import type { ReactElement } from "react";

import { tokens } from "@ome-labs/tokens";

import { saveBlob } from "./save.ts";

const svgNamespace = "http://www.w3.org/2000/svg";

/**
 * A standalone SVG document from a rendered React element, such as an icon. React's server renderer is about as
 * big as the rest of the kit, so it loads the first time someone downloads an SVG.
 */
export async function svgMarkup(element: ReactElement) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  // Attributes that only mean something on the page (hidden from screen readers, an empty class) are dropped.
  const markup = renderToStaticMarkup(element).replace(
    / (class|focusable|aria-hidden)="[^"]*"/g,
    "",
  );

  return markup.includes("xmlns=")
    ? markup
    : markup.replace("<svg", `<svg xmlns="${svgNamespace}"`);
}

/**
 * Resolves what only makes sense inside the page: `currentColor` becomes the colour it had on screen, and the kit's
 * font variables become the family names, so the file looks the same in Figma or a browser tab.
 */
export function resolveSvg(markup: string, color: string) {
  return markup
    .replaceAll("currentColor", color)
    .replace(/var\(--font-(display|sans|mono)\)/g, (_, family: "display" | "sans" | "mono") =>
      tokens.font.web[family].replaceAll('"', "'"),
    );
}

export function downloadSvg(markup: string, name: string) {
  saveBlob(new Blob([markup], { type: "image/svg+xml" }), `${name}.svg`);
}

/** The width and height an SVG draws at by default: its attributes, or else its viewBox. */
export function svgSize(markup: string) {
  const document = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = document.documentElement;
  const [, , viewWidth = 0, viewHeight = 0] = (svg.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map(Number);

  return {
    width: Number.parseFloat(svg.getAttribute("width") ?? "") || viewWidth,
    height: Number.parseFloat(svg.getAttribute("height") ?? "") || viewHeight,
  };
}
