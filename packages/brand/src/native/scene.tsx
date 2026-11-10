import { Image, StyleSheet, type ImageProps } from "react-native";

import { sceneSources } from "../generated/native/assets.ts";
import { manifest, type SceneId } from "../manifest.ts";

type SceneProps = Omit<ImageProps, "source" | "alt"> & {
  id: SceneId;
  /** Overrides the manifest's alt text; pass "" when the scene is decorative. */
  alt?: string;
};

/** One of the app's scenes. Metro picks @1x or @2x by screen density. */
export function Scene({ id, alt, style, ...props }: SceneProps) {
  const label = alt ?? manifest.scenes.find((item) => item.id === id)?.alt ?? "";

  return (
    <Image
      source={sceneSources[id]}
      accessible={label !== ""}
      accessibilityLabel={label}
      resizeMode="cover"
      style={StyleSheet.compose(styles.scene, style)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({ scene: { aspectRatio: 16 / 10 } });
