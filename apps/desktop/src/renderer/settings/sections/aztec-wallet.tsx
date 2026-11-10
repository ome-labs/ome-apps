import { type FormEvent, useCallback, useState } from "react";

import { Button, Switch, TextField } from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section } from "../parts.tsx";
import { useSave } from "../save.ts";

export function AztecWallet({ dir, sync }: { dir: string | null; sync: boolean }) {
  const save = useSave();
  const [draft, setDraft] = useState(dir ?? "");

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      void save(
        () => callOme("config.set", { aztecWalletDir: draft.trim() }),
        draft.trim() ? "aztec-wallet folder changed" : "Using aztec-wallet's default folder",
      );
    },
    [draft, save],
  );
  const toggleSync = useCallback(
    (on: boolean) =>
      void save(
        () => callOme("config.set", { aztecWalletSync: on }),
        on ? "Vault aliases go to aztec-wallet" : "Vault aliases stay in Ome",
      ),
    [save],
  );

  return (
    <Section
      id="aztec-wallet"
      title="aztec-wallet"
      description="Use your vaults from Aztec's CLI wallet."
    >
      <Row
        title="Write vault aliases into aztec-wallet"
        description="Pay a vault by name, like accounts:treasury."
      >
        <Switch
          label={<span className="sr-only">Write vault aliases</span>}
          checked={sync}
          onCheckedChange={toggleSync}
        />
      </Row>
      <Row
        title="Data folder"
        description="Empty uses ~/.aztec/wallet."
        below={
          <form className="flex items-start gap-2" onSubmit={submit} noValidate>
            <TextField
              label="Folder"
              className="flex-1"
              value={draft}
              onValueChange={setDraft}
              placeholder="~/.aztec/wallet"
              mono
            />
            <Button type="submit" className="mt-[26px]" disabled={draft.trim() === (dir ?? "")}>
              Save
            </Button>
          </form>
        }
      />
    </Section>
  );
}
