import { Image, StyleSheet, type ImageProps } from "react-native";

import { illustrationSources } from "../generated/native/assets.ts";
import { manifest, type IllustrationId } from "../manifest.ts";

type IllustrationProps = Omit<ImageProps, "source" | "alt"> & {
  id: IllustrationId;
  /** Overrides the manifest's alt text; pass "" when the scene is decorative. */
  alt?: string;
};

/** One of the kit's pixel scenes. Metro picks @1x or @2x by screen density. */
export function Illustration({ id, alt, style, ...props }: IllustrationProps) {
  const entry = manifest.illustrations.find((item) => item.id === id);
  const label = alt ?? entry?.alt ?? "";

  return (
    <Image
      source={illustrationSources[id]}
      accessible={label !== ""}
      accessibilityLabel={label}
      resizeMode="cover"
      style={StyleSheet.compose(styles.scene, style)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({ scene: { aspectRatio: 16 / 10 } });
