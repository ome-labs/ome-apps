import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppTour } from "./app-tour.tsx";

describe("AppTour", () => {
  it("is a tab list whose arrow keys move the selection and the focus", () => {
    render(<AppTour />);
    const vaults = screen.getByRole("tab", { name: "Vaults" });
    expect(vaults.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(vaults, { key: "ArrowLeft" });
    const phone = screen.getByRole("tab", { name: /Phone/ });
    expect(phone.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(phone);
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(phone.id);
  });

  it("shows the chosen tab's points", () => {
    render(<AppTour />);
    fireEvent.click(screen.getByRole("tab", { name: "Keepers" }));

    expect(screen.getByRole("heading", { name: "On the record" })).toBeDefined();
  });
});
