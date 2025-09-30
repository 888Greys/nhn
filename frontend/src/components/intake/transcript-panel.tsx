import { Button } from "@/components/ui/button";

type TranscriptHighlight = {
  timestamp: string;
  text: string;
  linkedFieldIds: string[];
};

type TranscriptPanelProps = {
  highlights: TranscriptHighlight[];
  onApplyHighlight: (fieldIds: string[], text: string) => void;
};

export function TranscriptPanel({ highlights, onApplyHighlight }: TranscriptPanelProps) {
  return (
    <div
      className="rounded-panel border-soft/70 bg-panel border p-4"
      role="region"
      aria-labelledby="transcript-heading"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p id="transcript-heading" className="text-ink-muted text-xs tracking-[0.3em] uppercase">
            Voice transcript
          </p>
          <p className="text-ink-muted text-sm">Placeholder data captured from mock recording.</p>
        </div>
        <Button variant="ghost" className="text-xs">
          Download .txt
        </Button>
      </div>
      <ul className="space-y-3">
        {highlights.map((highlight) => (
          <li
            key={highlight.timestamp}
            className="border-soft/70 rounded-lg border border-dashed p-3"
          >
            <p className="text-ink-muted font-mono text-xs">{highlight.timestamp}</p>
            <p className="text-ink mt-1 text-sm">{highlight.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-ink-muted text-xs">
                Map to fields: {highlight.linkedFieldIds.join(", ")}
              </p>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => onApplyHighlight(highlight.linkedFieldIds, highlight.text)}
              >
                Apply suggestions
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
