// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "@storybook/test";

import { TranscriptPanel } from "./transcript-panel";

const highlights = [
  {
    timestamp: "00:02:18",
    text: "Client wants Mathew to coordinate trust updates with tax advisor.",
    linkedFieldIds: ["primaryGoal", "representative"],
  },
  {
    timestamp: "00:07:41",
    text: "Estate includes three properties; rental condo carries a 280k mortgage.",
    linkedFieldIds: ["propertyCount", "assetNotes"],
  },
  {
    timestamp: "00:12:05",
    text: "Request follow-up meeting within ten days and mark priority as immediate.",
    linkedFieldIds: ["reviewPriority", "followUpDate"],
  },
];

const meta: Meta<typeof TranscriptPanel> = {
  title: "Intake/TranscriptPanel",
  component: TranscriptPanel,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    highlights,
    onApplyHighlight: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TranscriptPanel>;

export const Default: Story = {};

export const WithInteraction: Story = {
  render: () => {
    const [applied, setApplied] = useState<string | null>(null);

    return (
      <div className="space-y-4">
        <TranscriptPanel
          highlights={highlights}
          onApplyHighlight={(fieldIds, text) => setApplied(`${fieldIds.join(", ")} ← ${text}`)}
        />
        {applied ? (
          <p className="text-ink-muted text-sm">Last applied highlight: {applied}</p>
        ) : null}
      </div>
    );
  },
};

export const EmptyTranscript: Story = {
  args: {
    highlights: [],
  },
};
