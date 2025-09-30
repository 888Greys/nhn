"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntakeStepper } from "@/components/intake/stepper";
import { TranscriptPanel } from "@/components/intake/transcript-panel";
import {
  useAddReviewQueueItem,
  useIntakeDraft,
  useResetIntakeDraft,
  useUpdateIntakeDraft,
} from "@/hooks/use-intake-data";
import type { IntakeDraft, ReviewItem } from "@/services/intake-mock";
import { REVIEW_STATUS_LABELS } from "@/services/intake-mock";

type FieldType = "text" | "textarea" | "select" | "number" | "date";

type FieldConfig = {
  id: keyof IntakeFormState;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  options?: { label: string; value: string }[];
};

type StepConfig = {
  id: StepId;
  title: string;
  description: string;
  fields: FieldConfig[];
};

const steps: StepConfig[] = [
  {
    id: "profile",
    title: "Client profile",
    description: "Capture the individuals involved in the estate conversation.",
    fields: [
      {
        id: "clientName",
        label: "Primary client name",
        type: "text",
        placeholder: "e.g., Caldwell Family Trust",
      },
      {
        id: "representative",
        label: "Point of contact",
        type: "text",
        placeholder: "Assign the lawyer leading intake",
      },
      {
        id: "primaryGoal",
        label: "Primary objective",
        type: "select",
        options: [
          { label: "Establish new family trust", value: "new-trust" },
          { label: "Update existing trust", value: "update-trust" },
          { label: "Draft will", value: "will" },
          { label: "Succession planning", value: "succession" },
        ],
      },
      {
        id: "riskFlags",
        label: "Immediate risks",
        type: "textarea",
        helperText: "List disputes, deadlines, or compliance concerns.",
      },
    ],
  },
  {
    id: "assets",
    title: "Asset inventory",
    description: "Summarize holdings and structural questions for the AI to process.",
    fields: [
      {
        id: "estateValue",
        label: "Estimated estate value",
        type: "text",
        placeholder: "e.g., 12.5M USD",
      },
      {
        id: "propertyCount",
        label: "Number of properties",
        type: "number",
        placeholder: "e.g., 3",
      },
      {
        id: "trustStatus",
        label: "Trust status",
        type: "select",
        options: [
          { label: "No trust established", value: "none" },
          { label: "Draft in progress", value: "draft" },
          { label: "Fully executed", value: "executed" },
        ],
      },
      {
        id: "assetNotes",
        label: "Asset considerations",
        type: "textarea",
        helperText: "Highlight assets requiring AI clause lookup or compliance review.",
      },
    ],
  },
  {
    id: "directives",
    title: "Directives & succession",
    description: "Capture preferences for guardianship, succession, and review pace.",
    fields: [
      {
        id: "guardianPreference",
        label: "Guardian preference",
        type: "text",
        placeholder: "e.g., appoint eldest sibling",
      },
      {
        id: "successionConcerns",
        label: "Succession considerations",
        type: "textarea",
        helperText: "Outline special instructions or sensitive relationships.",
      },
      {
        id: "reviewPriority",
        label: "Review priority",
        type: "select",
        options: [
          { label: "Immediate", value: "immediate" },
          { label: "High", value: "high" },
          { label: "Standard", value: "standard" },
        ],
      },
      {
        id: "followUpDate",
        label: "Requested follow-up",
        type: "date",
      },
    ],
  },
  {
    id: "summary",
    title: "Review & export",
    description: "Review AI-ready summary before routing to legal approval.",
    fields: [],
  },
];

type StepId = "profile" | "assets" | "directives" | "summary";

type IntakeFormState = {
  clientName: string;
  representative: string;
  primaryGoal: string;
  riskFlags: string;
  estateValue: string;
  propertyCount: string;
  trustStatus: string;
  assetNotes: string;
  guardianPreference: string;
  successionConcerns: string;
  reviewPriority: string;
  followUpDate: string;
};

const defaultState: IntakeFormState = {
  clientName: "",
  representative: "",
  primaryGoal: "",
  riskFlags: "",
  estateValue: "",
  propertyCount: "",
  trustStatus: "",
  assetNotes: "",
  guardianPreference: "",
  successionConcerns: "",
  reviewPriority: "",
  followUpDate: "",
};

const draftFieldIds = Object.keys(defaultState) as (keyof IntakeFormState)[];

const draftsAreEqual = (left: IntakeFormState, right: IntakeFormState | IntakeDraft) =>
  draftFieldIds.every((field) => left[field] === right[field]);

const formatFollowUpLabel = (value: string) => {
  if (!value) {
    return "Schedule follow-up";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Schedule follow-up";
  }

  return `Follow-up ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
};
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "intake";

const buildWorkspaceReviewItem = (state: IntakeFormState): ReviewItem => {
  const slug = slugify(state.clientName || "intake");
  const title = state.clientName
    ? `${state.clientName} workspace handoff`
    : "New intake workspace handoff";

  const owner = state.representative ? `Assigned to ${state.representative}` : "Assign reviewer";

  return {
    id: `workspace-${slug}`,
    title,
    status: REVIEW_STATUS_LABELS.workspace,
    statusKey: "workspace",
    due: formatFollowUpLabel(state.followUpDate),
    owner,
  };
};

const profileSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  representative: z.string().min(1, "Point of contact is required"),
  primaryGoal: z.string().min(1, "Select an objective"),
  riskFlags: z.string().optional(),
});

const assetsSchema = z.object({
  estateValue: z.string().min(1, "Provide an estimate"),
  propertyCount: z
    .string()
    .min(1, "Enter count")
    .refine((value) => Number(value) >= 0 || value === "", "Must be zero or more"),
  trustStatus: z.string().min(1, "Select trust status"),
  assetNotes: z.string().optional(),
});

const directivesSchema = z.object({
  guardianPreference: z.string().min(1, "Guardian preference required"),
  successionConcerns: z.string().min(1, "Capture key succession notes"),
  reviewPriority: z.string().min(1, "Select priority"),
  followUpDate: z.string().min(1, "Schedule a follow-up"),
});

const stepSchemas: Record<Exclude<StepId, "summary">, z.ZodObject<Record<string, z.ZodTypeAny>>> = {
  profile: profileSchema,
  assets: assetsSchema,
  directives: directivesSchema,
};

const transcriptHighlights = [
  {
    timestamp: "00:02:18",
    text: "Client emphasised need to update existing trust to include new grandchild and wants Mathew to coordinate with tax advisor.",
    linkedFieldIds: ["primaryGoal", "representative", "successionConcerns"],
  },
  {
    timestamp: "00:07:41",
    text: "Estate includes three properties: primary residence, vacation home, and rental condo with outstanding mortgage of 280k.",
    linkedFieldIds: ["propertyCount", "assetNotes"],
  },
  {
    timestamp: "00:12:05",
    text: "Urgency flagged due to health concerns – request follow-up meeting within ten days and prioritize immediate review.",
    linkedFieldIds: ["reviewPriority", "followUpDate"],
  },
];

type ErrorMap = Partial<Record<keyof IntakeFormState, string>>;

export default function IntakeWizardPage() {
  const [formState, setFormState] = useState<IntakeFormState>(defaultState);
  const [currentStepId, setCurrentStepId] = useState<StepId>("profile");
  const [errors, setErrors] = useState<ErrorMap>({});
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState<"idle" | "success" | "error">("idle");
  const hasHydrated = useRef(false);
  const skipAutosave = useRef(false);
  const hasLocalEdits = useRef(false);

  const { data: remoteDraft, isLoading: isDraftLoading } = useIntakeDraft();
  const updateDraftMutation = useUpdateIntakeDraft();
  const resetDraftMutation = useResetIntakeDraft();
  const addReviewItemMutation = useAddReviewQueueItem();
  const { isPending: isDraftSaving } = updateDraftMutation;
  const { isPending: isAddingToQueue } = addReviewItemMutation;

  const activeStep = steps.find((step) => step.id === currentStepId) ?? steps[0];
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  useEffect(() => {
    if (!remoteDraft) {
      if (!isDraftLoading && !hasHydrated.current) {
        hasHydrated.current = true;
      }
      return;
    }

    const matchesCurrent = draftsAreEqual(formState, remoteDraft);

    if (!hasHydrated.current || (!matchesCurrent && !isDraftSaving && !hasLocalEdits.current)) {
      skipAutosave.current = true;
      setFormState(remoteDraft);
      hasHydrated.current = true;
      setAutosaveStatus("saved");
      setLastSavedAt(new Date().toLocaleTimeString());
      if (handoffStatus !== "idle") {
        setHandoffStatus("idle");
      }
      hasLocalEdits.current = false;
    }
  }, [remoteDraft, formState, isDraftLoading, isDraftSaving, handoffStatus]);
  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }

    setAutosaveStatus("saving");

    const timeout = window.setTimeout(() => {
      updateDraftMutation.mutate(formState, {
        onSuccess: () => {
          setAutosaveStatus("saved");
          setLastSavedAt(new Date().toLocaleTimeString());
          hasLocalEdits.current = false;
        },
        onError: () => {
          setAutosaveStatus("idle");
        },
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [formState, updateDraftMutation]);

  useEffect(() => {
    if (currentStepId === "summary") {
      return;
    }

    if (!hasHydrated.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLastSavedAt(new Date().toLocaleTimeString());
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [formState, currentStepId]);

  const validateStep = (stepId: StepId) => {
    if (stepId === "summary") {
      setErrors({});
      return true;
    }

    const schema = stepSchemas[stepId];
    const stepFieldIds =
      steps.find((step) => step.id === stepId)?.fields.map((field) => field.id) ?? [];
    const subState = stepFieldIds.reduce<Record<string, unknown>>((acc, fieldId) => {
      acc[fieldId] = formState[fieldId];
      return acc;
    }, {});

    const result = schema.safeParse(subState);

    if (!result.success) {
      const fieldErrors: ErrorMap = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof IntakeFormState;
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleFieldChange = (fieldId: keyof IntakeFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    if (handoffStatus !== "idle") {
      setHandoffStatus("idle");
    }
    hasLocalEdits.current = true;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStepId)) {
      return;
    }

    const next = steps[currentStepIndex + 1];
    if (next) {
      setCurrentStepId(next.id);
    }
  };

  const goToPreviousStep = () => {
    const prev = steps[currentStepIndex - 1];
    if (prev) {
      setCurrentStepId(prev.id);
    }
  };

  const handleStepSelect = (stepId: string) => {
    const targetIndex = steps.findIndex((step) => step.id === stepId);
    if (targetIndex === -1 || targetIndex > currentStepIndex + 1) {
      return;
    }

    if (targetIndex > currentStepIndex && !validateStep(currentStepId)) {
      return;
    }

    setCurrentStepId(stepId as StepId);
  };

  const applyTranscriptHighlight = (fieldIds: string[], text: string) => {
    fieldIds.forEach((fieldId) => {
      const key = fieldId as keyof IntakeFormState;
      if (formState[key]) return;
      setFormState((prev) => ({
        ...prev,
        [key]: text,
      }));
    });
  };

  const resetDraft = () => {
    resetDraftMutation.mutate(undefined, {
      onSuccess: (data) => {
        skipAutosave.current = true;
        setFormState(data);
        setRiskAcknowledged(false);
        setCurrentStepId("profile");
        setErrors({});
        setHandoffStatus("idle");
        setAutosaveStatus("saved");
        setLastSavedAt(new Date().toLocaleTimeString());
        hasLocalEdits.current = false;
      },
    });
  };

  const summaryRows = useMemo(
    () => [
      { label: "Client name", value: formState.clientName || "–" },
      { label: "Point of contact", value: formState.representative || "–" },
      { label: "Objective", value: formState.primaryGoal || "–" },
      { label: "Immediate risks", value: formState.riskFlags || "–" },
      { label: "Estate value", value: formState.estateValue || "–" },
      { label: "Properties", value: formState.propertyCount || "–" },
      { label: "Trust status", value: formState.trustStatus || "–" },
      { label: "Asset considerations", value: formState.assetNotes || "–" },
      { label: "Guardian preference", value: formState.guardianPreference || "–" },
      { label: "Succession", value: formState.successionConcerns || "–" },
      { label: "Review priority", value: formState.reviewPriority || "–" },
      { label: "Follow-up", value: formatFollowUpLabel(formState.followUpDate) },
    ],
    [formState],
  );

  const handleSendToWorkspace = () => {
    if (!riskAcknowledged || isAddingToQueue) {
      return;
    }

    const reviewItem = buildWorkspaceReviewItem(formState);
    addReviewItemMutation.mutate(reviewItem, {
      onSuccess: () => {
        setHandoffStatus("success");
      },
      onError: () => {
        setHandoffStatus("error");
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Client intake wizard</h1>
          <p className="text-ink-muted text-sm">
            Guided workflow blending voice capture, structured fields, and legal review checkpoints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {autosaveStatus === "saving" && <Badge variant="outline">Saving draft…</Badge>}
          {autosaveStatus === "saved" && lastSavedAt && (
            <Badge variant="outline">Saved {lastSavedAt}</Badge>
          )}
          <Button
            variant="ghost"
            className="text-sm"
            onClick={resetDraft}
            disabled={resetDraftMutation.isPending || isDraftLoading}
          >
            Reset draft
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_2fr]">
        <IntakeStepper
          steps={steps.map(({ id, title, description }) => ({ id, title, description }))}
          activeStepId={currentStepId}
          onStepSelect={handleStepSelect}
        />

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="outline" className="mb-2 tracking-[0.3em] uppercase">
                  Step {currentStepIndex + 1}
                </Badge>
                <h2 className="text-xl font-semibold">{activeStep.title}</h2>
                <p className="text-ink-muted text-sm">{activeStep.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentStepId !== "summary" && (
                  <Button
                    variant="ghost"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                  >
                    Back
                  </Button>
                )}
                {currentStepId !== "summary" ? (
                  <Button variant="primary" onClick={goToNextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={!riskAcknowledged || isAddingToQueue}
                    onClick={handleSendToWorkspace}
                  >
                    {isAddingToQueue ? "Sending…" : "Send to workspace"}
                  </Button>
                )}
              </div>
            </div>

            {isDraftLoading ? (
              <p className="text-ink-muted text-sm">Loading draft…</p>
            ) : currentStepId !== "summary" ? (
              <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
                {activeStep.fields.map((field) => (
                  <div key={field.id.toString()} className="flex flex-col gap-1.5">
                    <label htmlFor={field.id} className="text-ink text-sm font-medium">
                      {field.label}
                    </label>
                    {renderField({
                      field,
                      value: formState[field.id],
                      onChange: handleFieldChange,
                    })}
                    {field.helperText ? (
                      <p className="text-ink-muted text-xs">{field.helperText}</p>
                    ) : null}
                    {errors[field.id] ? (
                      <p className="text-warning text-xs">{errors[field.id]}</p>
                    ) : null}
                  </div>
                ))}
              </form>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {handoffStatus !== "idle" ? (
                  <div
                    className={clsx(
                      "rounded-panel border p-4 text-sm md:col-span-2",
                      handoffStatus === "success"
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-red-300 bg-red-50 text-red-700",
                    )}
                  >
                    {handoffStatus === "success"
                      ? "Workspace queue updated. Reviewers will see this intake under the workspace filter."
                      : "We couldn’t update the workspace queue. Please retry in a moment."}
                  </div>
                ) : null}
                <div className="space-y-4">
                  <div className="rounded-panel border-soft/70 border p-4">
                    <h3 className="text-base font-semibold">Summary</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      {summaryRows.map((row) => (
                        <div key={row.label} className="flex gap-2">
                          <dt className="text-ink-muted w-40 flex-shrink-0">{row.label}</dt>
                          <dd className="text-ink flex-1">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="rounded-panel border-soft/70 border p-4">
                    <h3 className="text-base font-semibold">Risk checklist</h3>
                    <label className="mt-3 flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        className="border-soft h-4 w-4 rounded border"
                        checked={riskAcknowledged}
                        onChange={(event) => setRiskAcknowledged(event.target.checked)}
                      />
                      I confirm risks and open items are documented above.
                    </label>
                  </div>
                </div>
                <div className="rounded-panel border-soft/70 border p-4">
                  <h3 className="text-base font-semibold">Next actions</h3>
                  <ul className="text-ink-muted mt-3 space-y-2 text-sm">
                    <li>• Generate AI draft memo and attach supporting documents.</li>
                    <li>• Schedule review session once workspace confirms availability.</li>
                    <li>• Share summary with compliance before client-facing delivery.</li>
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary">Download draft PDF</Button>
                    <Button variant="ghost">Notify reviewers</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {currentStepId !== "summary" && (
            <TranscriptPanel
              highlights={transcriptHighlights}
              onApplyHighlight={applyTranscriptHighlight}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type RenderFieldArgs = {
  field: FieldConfig;
  value: string;
  onChange: (fieldId: keyof IntakeFormState, value: string) => void;
};

function renderField({ field, value, onChange }: RenderFieldArgs) {
  const commonProps = {
    id: field.id,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(field.id, event.target.value),
    className:
      "border-soft focus-visible:ring-accent rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2",
    placeholder: field.placeholder,
  } as const;

  switch (field.type) {
    case "textarea":
      return <textarea rows={4} {...commonProps} />;
    case "select":
      return (
        <select {...commonProps}>
          <option value="">Select option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "number":
      return <input type="number" {...commonProps} />;
    case "date":
      return <input type="date" {...commonProps} />;
    default:
      return <input type="text" {...commonProps} />;
  }
}
