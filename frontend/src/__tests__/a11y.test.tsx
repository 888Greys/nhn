import { cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

import Home from "@/app/page";
import IntakeWizardPage from "@/app/intake/page";
import { renderWithProviders } from "./test-utils";

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

describe("Accessibility", () => {
  it("home page is accessible", async () => {
    const { container } = renderWithProviders(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("intake wizard is accessible", async () => {
    const { container } = renderWithProviders(<IntakeWizardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
