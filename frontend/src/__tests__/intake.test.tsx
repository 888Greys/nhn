import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IntakeWizardPage from "@/app/intake/page";
import { renderWithProviders } from "./test-utils";

describe("Intake wizard", () => {
  it("renders step content", () => {
    renderWithProviders(<IntakeWizardPage />);

    expect(screen.getByRole("heading", { name: /Client intake wizard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Client profile/i })).toBeInTheDocument();
  });

  it("validates required fields before continuing", async () => {
    renderWithProviders(<IntakeWizardPage />);

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    await userEvent.click(continueButton);

    expect(await screen.findByText(/Client name is required/i)).toBeInTheDocument();
  });

  it("queues a workspace handoff when the risk checklist is acknowledged", async () => {
    renderWithProviders(<IntakeWizardPage />);

    await waitFor(() => expect(screen.queryByText(/Loading draft/i)).not.toBeInTheDocument(), {
      timeout: 5000,
    });

    const clientNameInput = await screen.findByLabelText(/Primary client name/i);
    await userEvent.type(clientNameInput, "Avery Estate");
    await waitFor(() => expect(clientNameInput).toHaveValue("Avery Estate"));
    const representativeInput = await screen.findByLabelText(/Point of contact/i);
    await userEvent.type(representativeInput, "Mathew Greys");
    await userEvent.selectOptions(await screen.findByLabelText(/Primary objective/i), "succession");
    await waitFor(() => expect(representativeInput).toHaveValue("Mathew Greys"));

    const primaryGoalSelect = await screen.findByLabelText(/Primary objective/i);
    await userEvent.selectOptions(primaryGoalSelect, "succession");
    await waitFor(() => expect(primaryGoalSelect).toHaveValue("succession"));
    await waitFor(
      () => expect(screen.getByRole("heading", { name: /Asset inventory/i })).toBeInTheDocument(),
      { timeout: 4000 },
    );

    const estateValueInput = await screen.findByLabelText(/Estimated estate value/i, {}, { timeout: 4000 });
    await userEvent.type(estateValueInput, "12.5M USD");
    await waitFor(() => expect(estateValueInput).toHaveValue("12.5M USD"));
    await userEvent.type(await screen.findByLabelText(/Number of properties/i), "3");
    const propertyCountInput = await screen.findByLabelText(/Number of properties/i);
    await userEvent.type(propertyCountInput, "3");
    await waitFor(() => expect(propertyCountInput).toHaveValue("3"));

    const trustStatusSelect = await screen.findByLabelText(/Trust status/i);
    await userEvent.selectOptions(trustStatusSelect, "executed");
    await waitFor(() => expect(trustStatusSelect).toHaveValue("executed"));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(
      () =>
        expect(
          screen.getByRole("heading", { name: /Directives & succession/i }),
        ).toBeInTheDocument(),
      { timeout: 4000 },
    );

    const guardianPreferenceInput = await screen.findByLabelText(
      /Guardian preference/i,
      {},
      { timeout: 4000 },
    );
    await userEvent.type(guardianPreferenceInput, "Appoint eldest sibling");
    await waitFor(() => expect(guardianPreferenceInput).toHaveValue("Appoint eldest sibling"));
    await userEvent.type(
    const successionNotesInput = await screen.findByLabelText(/Succession considerations/i);
    await userEvent.type(successionNotesInput, "Include new grandchild");
    await waitFor(() => expect(successionNotesInput).toHaveValue("Include new grandchild"));

    const reviewPrioritySelect = await screen.findByLabelText(/Review priority/i);
    await userEvent.selectOptions(reviewPrioritySelect, "immediate");
    await waitFor(() => expect(reviewPrioritySelect).toHaveValue("immediate"));

    const followUpInput = await screen.findByLabelText(/Requested follow-up/i);
    await userEvent.type(followUpInput, "2025-08-10");
    await waitFor(() => expect(followUpInput).toHaveValue("2025-08-10"));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    const riskCheckbox = screen.getByRole("checkbox", {
      name: /I confirm risks and open items/i,
    });
    await userEvent.click(riskCheckbox);

    const sendButton = screen.getByRole("button", { name: /Send to workspace/i });
    await userEvent.click(sendButton);

    expect(
      await screen.findByText(/Workspace queue updated. Reviewers will see this intake/i),
    ).toBeInTheDocument();
  });
});
