import clsx from "clsx";

type Step = {
  id: string;
  title: string;
  description?: string;
};

type IntakeStepperProps = {
  steps: Step[];
  activeStepId: string;
  onStepSelect?: (id: string) => void;
};

export function IntakeStepper({ steps, activeStepId, onStepSelect }: IntakeStepperProps) {
  return (
    <ol className="rounded-panel border-soft/70 bg-panel border p-4">
      {steps.map((step, index) => {
        const isActive = step.id === activeStepId;
        const isComplete = steps.findIndex((s) => s.id === activeStepId) > index;

        return (
          <li
            key={step.id}
            className={clsx(
              "flex items-start gap-3 rounded-lg p-3 transition",
              isActive ? "bg-accent/10" : "hover:bg-panel-strong",
            )}
          >
            <button
              type="button"
              className={clsx(
                "mt-1 grid h-6 w-6 place-items-center rounded-full border text-xs font-semibold",
                isActive
                  ? "border-accent bg-accent text-white"
                  : isComplete
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-soft text-ink-muted",
              )}
              onClick={() => onStepSelect?.(step.id)}
              aria-current={isActive ? "step" : undefined}
            >
              {index + 1}
            </button>
            <div className="flex-1">
              <p className="text-ink text-sm font-semibold">{step.title}</p>
              {step.description ? (
                <p className="text-ink-muted mt-1 text-xs">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
