import { useEffect, useRef } from "react";

import { illustrationSource } from "../art/art-files.ts";
import { interpolateRows, type SkyRows } from "./field.ts";
import { measureSky, pixelSize, type SkyLayout } from "./layout.ts";
import { cloudNoise } from "./noise.ts";
import { paintSky, type PaintedScene } from "./render.ts";
import type { SkySceneId } from "./scene-edges.ts";
import { loadScenePixels, sceneHeight, sceneWidth } from "./scene-pixels.ts";

/** One logical column of cloud drift every 1.5 s (motion/drift). */
const driftEvery = 1500;

type Painted = {
  k: number;
  width: number;
  layout: SkyLayout;
  rows: SkyRows;
  noise: Float32Array;
  /** Rows the noise covers; it can outlast a shorter page. */
  noiseRows: number;
};

/**
 * The dithered sky behind every page: one day on the lake, from dawn at the top of the page to first light at the
 * bottom. A fixed canvas at the art's logical resolution repaints the rows in view as the page scrolls, so a
 * 10 000 px page costs a 320 × 200 canvas. `page` re-measures the hours after a client-side navigation.
 */
export function SkyCanvas({ page }: { page: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pixels = new Map<SkySceneId, Uint8ClampedArray>();
    const requested = new Set<SkySceneId>();
    let painted: Painted | undefined;
    let frame = 0;
    let drift = 0;
    let disposed = false;

    function measure() {
      const k = pixelSize(root.clientWidth);
      const width = Math.ceil(root.clientWidth / k);
      root.style.setProperty("--k", `${k}px`);

      const layout = measureSky(document, k, width);
      const rows = interpolateRows(layout.keys, layout.rowCount);
      // Noise only depends on the field's size; keep it while the page height stays within what it covers.
      const previous = painted;
      const reuse =
        previous !== undefined && previous.width === width && previous.noiseRows >= layout.rowCount;
      const noise = reuse ? previous.noise : cloudNoise(width, layout.rowCount, seedFor(page));
      const noiseRows = reuse ? previous.noiseRows : layout.rowCount;
      painted = { k, width, layout, rows, noise, noiseRows };

      for (const scene of layout.scenes) void loadScene(scene.id);

      schedule();
    }

    async function loadScene(id: SkySceneId) {
      const source = illustrationSource(id);
      if (requested.has(id) || !source) return;
      requested.add(id);

      const art = await loadScenePixels(source["1x"]);
      if (disposed) return;
      pixels.set(id, art);
      schedule();
    }

    function draw() {
      frame = 0;
      if (!painted || !canvas || !context) return;

      const { k, width, layout, rows, noise } = painted;
      const firstRow = Math.floor(window.scrollY / k);
      const visibleRows = Math.ceil(window.innerHeight / k) + 2;

      if (canvas.width !== width || canvas.height !== visibleRows) {
        canvas.width = width;
        canvas.height = visibleRows;
        canvas.style.width = `${width * k}px`;
        canvas.style.height = `${visibleRows * k}px`;
      }
      canvas.style.transform = `translate3d(0, ${-(window.scrollY - firstRow * k)}px, 0)`;

      const scenes: PaintedScene[] = [];
      for (const scene of layout.scenes) {
        const art = pixels.get(scene.id);
        if (!art) continue;
        scenes.push({
          row: scene.row,
          column: scene.column,
          width: sceneWidth,
          height: sceneHeight,
          pixels: art,
        });
        scene.element.dataset.painted = "";
      }

      const image = context.createImageData(width, visibleRows);
      paintSky(image, firstRow, { width, rows, noise, scenes, moons: layout.moons, drift });
      context.putImageData(image, 0, 0);
      root.classList.add("sky-on");
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    let measureTimer = 0;
    function remeasureSoon() {
      window.clearTimeout(measureTimer);
      measureTimer = window.setTimeout(measure, 120);
    }

    const resize = new ResizeObserver(remeasureSoon);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasureSoon);

    const drifting = window.setInterval(() => {
      if (reducedMotion.matches || document.hidden || !painted) return;
      drift = (drift + 1) % painted.width;
      schedule();
    }, driftEvery);

    measure();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(measureTimer);
      window.clearInterval(drifting);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasureSoon);
    };
  }, [page]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pixelated pointer-events-none fixed top-0 left-0 -z-10 will-change-transform"
    />
  );
}

/** Each page gets its own clouds, the same on every visit. */
function seedFor(page: string): number {
  let seed = 7;
  for (const character of page) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;

  return seed;
}
