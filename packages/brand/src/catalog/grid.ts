// The pixel grid each kind of art is drawn on (Figma pages 12, 13, 19). Exports are whole-number
// multiples of these, with nearest-neighbour scaling, so pixels stay square and sharp.
export const grids = {
  illustrations: { width: 320, height: 200, scales: { "1x": 2, "2x": 4 } },
  textures: { width: 240, height: 150, scales: { "1x": 2, "2x": 4 } },
  objects: { width: 32, height: 32 },
} as const;
