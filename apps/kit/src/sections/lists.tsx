import { ActivityRow, ProposalRow, toast } from "@ome-labs/ui-native";
import { View } from "react-native";

import { daveAlias, now, omet, proposals } from "./sample.ts";
import { Specimen } from "./specimen.tsx";

const aliceAccount = "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31";

export function Lists() {
  return (
    <>
      <Specimen title="Proposals">
        <View className="overflow-hidden rounded-lg border border-line-subtle">
          {[proposals.designWork, proposals.tooLarge, proposals.auditDeposit].map((proposal) => (
            <ProposalRow
              key={proposal.id}
              proposal={proposal}
              recipient={proposal.id === proposals.auditDeposit.id ? daveAlias : null}
              now={now}
              onPress={() => toast.info(`Open ${proposal.id.slice(2, 6)}`)}
              className="border-b border-line-subtle"
            />
          ))}
        </View>
      </Specimen>
      <Specimen title="Activity">
        <View className="overflow-hidden rounded-lg border border-line-subtle bg-surface">
          <ActivityRow
            entry={{
              kind: "proposal",
              at: now - 720,
              proposal: { ...proposals.auditDeposit, status: "executed" },
            }}
            now={now}
          />
          <ActivityRow
            entry={{
              kind: "received",
              at: now - 7200,
              token: omet,
              from: aliceAccount,
              amount: "1000000000000000000000",
              txHash: "0xf1ac958104443f60cd437bf3c758411c6e2e01c5f70194d83735020805015338",
              block: 1182,
            }}
            names={{ [aliceAccount]: "Alice" }}
            now={now}
          />
        </View>
      </Specimen>
    </>
  );
}
