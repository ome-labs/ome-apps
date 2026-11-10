import { useState } from "react";

import {
  Button,
  CheckRow,
  CodeBox,
  QrCode,
  ReviewPanel,
  Sheet,
  StepList,
  StepRow,
  toast,
} from "@ome-labs/ui-native";

import { review, treasury } from "./sample.ts";
import { Specimen } from "./specimen.tsx";

/** What the phone is for: reviewing and signing, codes, and following long steps. */
export function Signing() {
  const [reviewing, setReviewing] = useState(false);

  return (
    <>
      <Specimen title="Review in a sheet">
        <Button variant="primary" icon="signature" onPress={() => setReviewing(true)}>
          Review 3eb2
        </Button>
        <Sheet
          title="Review proposal 3eb2"
          description="From Alice · expires in 22h"
          open={reviewing}
          onOpenChange={setReviewing}
        >
          <ReviewPanel
            review={review}
            onApprove={() => {
              setReviewing(false);
              toast.success("Approved 3eb2.");
            }}
            onReject={() => setReviewing(false)}
          />
        </Sheet>
      </Specimen>
      <Specimen title="Checks">
        <CheckRow state="pass" label="Payload rebuilt and matches" />
        <CheckRow state="warning" label="Recipient label is an unverified alias" />
        <CheckRow state="fail" label="Made under an older config" />
      </Specimen>
      <Specimen title="Execution">
        <StepList label="Execution">
          <StepRow status="done" label="Rebuilding" time="0.21 s" />
          <StepRow
            status="active"
            label="Proving"
            detail="This can take a while with real proofs."
            time="38 s"
          />
          <StepRow status="pending" label="Sending" />
          <StepRow status="pending" label="Mined" />
        </StepList>
      </Specimen>
      <Specimen title="Codes">
        <QrCode value={treasury.address} label="Treasury's address" />
        <CodeBox
          label="Invite"
          value="ome-invite-v0:0xcd043027c1d5f5df2bd9abdabc192fec"
          hint="Holds no secrets. Send it to each co-founder."
        />
      </Specimen>
    </>
  );
}
