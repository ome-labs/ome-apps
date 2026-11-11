// Membership changes in a member's words: what a plan changes, and each step of the rotation that carries it out.
import type { CommitteeShape, MembershipPlan, RotationStepId } from "@ome-labs/api";

/** "3 members · 2 to spend · 2 to read". */
export function shapeLine(shape: CommitteeShape): string {
  const n = shape.members.length;
  return `${n} ${n === 1 ? "member" : "members"} · ${shape.threshold} to spend · ${shape.viewingThreshold} to read`;
}

/** What a plan changes, one line each: who leaves, who joins, and the thresholds that move. */
export function planChanges(plan: Pick<MembershipPlan, "current" | "next">): string[] {
  const { current, next } = plan;
  const leaving = current.members.filter((name) => !next.members.includes(name));
  const joining = next.members.filter((name) => !current.members.includes(name));
  const changes: string[] = [];
  if (leaving.length > 0)
    changes.push(`${list(leaving)} ${leaving.length === 1 ? "leaves" : "leave"}`);
  if (joining.length > 0)
    changes.push(`${list(joining)} ${joining.length === 1 ? "joins" : "join"}`);
  if (current.threshold !== next.threshold)
    changes.push(
      `Approvals to spend: ${current.threshold} → ${next.threshold} of ${next.members.length}`,
    );
  if (current.viewingThreshold !== next.viewingThreshold)
    changes.push(
      `Keepers to read: ${current.viewingThreshold} → ${next.viewingThreshold} of ${next.members.length}`,
    );
  return changes;
}

function list(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

const STEP_LABELS: Record<RotationStepId, string> = {
  reshare: "Share the viewing key anew",
  propose: "Propose the change",
  approve: "Approve it",
  execute: "Execute it",
  activate: "Switch to the new committee",
};

export function rotationStepLabel(step: RotationStepId): string {
  return STEP_LABELS[step];
}
