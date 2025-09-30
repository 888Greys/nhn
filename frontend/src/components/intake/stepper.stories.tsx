// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { IntakeStepper } from "./stepper";

const steps = [
  {
    id: "profile",
    title: "Client profile",
    description: "Capture the individuals involved in the estate conversation.",
  },
  {
    id: "assets",
    title: "Asset inventory",
    description: "Summarize holdings the AI should analyze.",
  },
  {
    id: "directives",
    title: "Directives & succession",
    description: "Document preferences before drafting.",
  },
  {
    id: "summary",
    title: "Review & export",
    description: "Confirm risks and hand off to workspace.",
  },
];

const meta: Meta<typeof IntakeStepper> = {
  title: "Intake/IntakeStepper",
  component: IntakeStepper,
  parameters: {
    layout: "centered",
  },
  args: {
    steps,
  },
};

export default meta;

type Story = StoryObj<typeof IntakeStepper>;

export const Overview: Story = {
  args: {
    activeStepId: "profile",
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState("assets");

    return (
      <IntakeStepper
        steps={steps}
        activeStepId={activeStep}
        onStepSelect={(stepId) => setActiveStep(stepId)}
      />
    );
  },
};
