// A scene's pixels at its logical size (320 × 200): the 1x webp is drawn at two image pixels per logical pixel,
// so every second pixel, from the centre of each block, is the art itself.

export const sceneWidth = 320;
export const sceneHeight = 200;

export async function loadScenePixels(source: string): Promise<Uint8ClampedArray> {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No 2D canvas");
  context.drawImage(image, 0, 0);

  const scale = image.naturalWidth / sceneWidth;
  const offset = Math.floor(scale / 2);
  const full = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels = new Uint8ClampedArray(sceneWidth * sceneHeight * 4);

  for (let y = 0; y < sceneHeight; y++) {
    for (let x = 0; x < sceneWidth; x++) {
      const from = ((y * scale + offset) * canvas.width + (x * scale + offset)) * 4;
      pixels.set(full.subarray(from, from + 4), (y * sceneWidth + x) * 4);
    }
  }

  return pixels;
}
