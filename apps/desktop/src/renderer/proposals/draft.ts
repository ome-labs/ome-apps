// A transfer as the member types it, and the intent it becomes once every field is valid.
import type { Hex32, Intent, TokenBalance } from "@ome-labs/api";
import { amountInputMessage, parseAmount } from "@ome-labs/format";

export const MEMO_LIMIT = 280;
const ADDRESS = /^0x[0-9a-fA-F]{64}$/;

/** Hours, as the segmented control's values. The daemon takes 1 to 720. */
export type Expiry = "1" | "24" | "72" | "168";
export const EXPIRY_OPTIONS: { value: Expiry; label: string }[] = [
  { value: "1", label: "1 hour" },
  { value: "24", label: "1 day" },
  { value: "72", label: "3 days" },
  { value: "168", label: "1 week" },
];

export type TransferDraft = {
  token: Hex32 | undefined;
  to: string;
  amount: string;
  memo: string;
  expiry: Expiry;
};

export type DraftErrors = { to?: string; amount?: string };

/** The intent, or why not yet. Empty fields aren't errors until the member has typed in them. */
export function readDraft(
  draft: TransferDraft,
  tokens: TokenBalance[],
): { intent: Intent | undefined; errors: DraftErrors } {
  const errors: DraftErrors = {};
  const token = tokens.find((entry) => entry.token.address === draft.token)?.token;
  const to = draft.to.trim();
  if (to && !ADDRESS.test(to)) errors.to = "An Aztec address is 0x and 64 hex characters.";

  let amount: string | undefined;
  if (token && draft.amount.trim()) {
    const parsed = parseAmount(draft.amount, token.decimals);
    if (parsed.ok) amount = parsed.amount;
    else errors.amount = amountInputMessage(parsed.error, token);
  }

  const intent: Intent | undefined =
    token && amount && ADDRESS.test(to)
      ? {
          kind: "transfer",
          token: token.address,
          to: to.toLowerCase() as Hex32,
          amount,
          memo: draft.memo.trim() || null,
        }
      : undefined;
  return { intent, errors };
}
