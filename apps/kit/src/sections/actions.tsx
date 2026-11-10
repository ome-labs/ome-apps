import { Button, IconButton } from "@ome-labs/ui-native";
import { View } from "react-native";

import { Specimen } from "./specimen.tsx";

const noop = () => {};

export function Actions() {
  return (
    <>
      <Specimen title="Buttons">
        <Button variant="primary" icon="signature" onPress={noop}>
          Approve
        </Button>
        <Button onPress={noop}>Review</Button>
        <Button variant="ghost" onPress={noop}>
          Cancel
        </Button>
        <Button variant="danger" onPress={noop}>
          Reject
        </Button>
        <Button variant="primary" size="lg" disabled>
          Execute
        </Button>
      </Specimen>
      <Specimen title="Icon buttons">
        <View className="flex-row gap-2">
          <IconButton icon="lock" label="Lock signer" onPress={noop} />
          <IconButton icon="qr" label="Show QR code" onPress={noop} />
          <IconButton icon="more-horizontal" label="More" disabled />
        </View>
      </Specimen>
    </>
  );
}
