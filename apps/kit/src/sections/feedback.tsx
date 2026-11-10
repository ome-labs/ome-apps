import { useState } from "react";

import {
  Banner,
  Button,
  Card,
  CardHeader,
  DetailRow,
  EmptyState,
  TypeToConfirm,
  toast,
} from "@ome-labs/ui-native";

import { treasury } from "./sample.ts";
import { Specimen } from "./specimen.tsx";

const noop = () => {};

export function Feedback() {
  const [removing, setRemoving] = useState(false);

  return (
    <>
      <Specimen title="Banners">
        <Banner kind="alarm" action={{ label: "Review", onPress: noop }}>
          This vault's on-chain config names a committee your keeper can't verify. It won't act
          until you look.
        </Banner>
        <Banner kind="warning">Member 3's keeper sent invalid read shares.</Banner>
        <Banner kind="info">
          A membership change didn't complete; its pending share was discarded.
        </Banner>
      </Specimen>
      <Specimen title="Toasts">
        <Button onPress={() => toast.success("New members active (epoch 2).")}>Show a toast</Button>
      </Specimen>
      <Specimen title="Typed confirmation">
        <Button variant="danger" onPress={() => setRemoving(true)}>
          Remove Carol…
        </Button>
        <TypeToConfirm
          open={removing}
          onOpenChange={setRemoving}
          title="Remove Carol from Treasury?"
          description="Carol's keeper share will be replaced. This needs approvals like any proposal, and removes at most t − 1 members."
          phrase={treasury.name}
          confirmLabel="Remove member"
          onConfirm={() => setRemoving(false)}
        />
      </Specimen>
      <Specimen title="Card">
        <Card>
          <CardHeader title={treasury.name} subtitle="Founded Nov 9, 2026" />
          <DetailRow label="Approvals to spend">2 of 3</DetailRow>
          <DetailRow label="Members to read" last>
            2 of 3
          </DetailRow>
        </Card>
      </Specimen>
      <Specimen title="Empty state">
        <Card>
          <EmptyState illustration="no-proposals" title="Nothing waiting for you." />
        </Card>
      </Specimen>
    </>
  );
}
