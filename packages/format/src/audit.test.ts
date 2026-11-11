import { expect, test } from "vitest";

import { auditOutcome, auditPurpose, auditRequester } from "./audit.ts";

test("names each purpose, and keeps one it doesn't know", () => {
  expect(auditPurpose("decryption")).toBe("Reading a payment or balance");
  expect(auditPurpose("recipient-tag")).toBe("Finding notes sent to the vault");
  expect(auditPurpose("future-purpose")).toBe("future-purpose");
});

test("names who asked", () => {
  expect(auditRequester({ requester: "local", requesterName: null })).toBe("You");
  expect(auditRequester({ requester: "0x01", requesterName: "Bob" })).toBe("Bob");
  expect(auditRequester({ requester: `0x${"ab".repeat(32)}`, requesterName: null })).toBe(
    "Keeper 0xabab…abab",
  );
});

test("reads a refusal's reason", () => {
  expect(auditOutcome("served")).toEqual({ text: "Served", tone: "success", refused: false });
  expect(auditOutcome("refused: not in the committee")).toEqual({
    text: "Refused: not in the committee",
    tone: "danger",
    refused: true,
  });
});
