import { type FormEvent, useCallback, useState } from "react";

import { Button, TextField } from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section } from "../parts.tsx";
import { useSave } from "../save.ts";

const ZERO_SALT = `0x${"0".repeat(64)}`;

export function Fees({ salt }: { salt: string }) {
  const save = useSave();
  const [draft, setDraft] = useState(salt);
  const [error, setError] = useState<string>();

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const next = draft.trim().toLowerCase();
      if (!/^0x[0-9a-f]{64}$/u.test(next)) {
        setError("Use 0x and 64 hex characters.");
        return;
      }
      setError(undefined);
      await save(
        () => callOme("config.set", { feePayerSalt: next as `0x${string}` }),
        "Fee payer changed",
      );
    },
    [draft, save],
  );
  const reset = useCallback(() => setDraft(ZERO_SALT), []);

  return (
    <Section id="fees" title="Fees" description="Who pays for your transactions. Never the vault.">
      <Row
        title="Fee payer salt"
        description="Zero uses the network's sponsored fee payer."
        below={
          <form className="flex items-start gap-2" onSubmit={submit} noValidate>
            <TextField
              label="Salt"
              className="flex-1"
              value={draft}
              onValueChange={setDraft}
              error={error}
              mono
            />
            <Button
              className="mt-[26px]"
              variant="ghost"
              onClick={reset}
              disabled={draft === ZERO_SALT}
            >
              Zero
            </Button>
            <Button
              type="submit"
              className="mt-[26px]"
              disabled={draft.trim().toLowerCase() === salt}
            >
              Save
            </Button>
          </form>
        }
      />
    </Section>
  );
}
