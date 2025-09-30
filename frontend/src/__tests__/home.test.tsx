import { screen, within } from "@testing-library/react";
import Home from "@/app/page";
import { renderWithProviders } from "./test-utils";

describe("Home page", () => {
  it("renders the HNC prototype overview", () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /Align HNC’s intake, drafting, and review/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Client intake wizard/i })).toBeInTheDocument();
  });

  it("exposes review queue items", async () => {
    renderWithProviders(<Home />);

    const region = await screen.findByRole("region", { name: /Review queue/i });
    const cards = within(region).getAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });
});
