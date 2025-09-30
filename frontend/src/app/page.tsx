"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReviewQueue, useUpdateReviewQueueStatus } from "@/hooks/use-intake-data";
import { REVIEW_STATUS_LABELS, type ReviewStatusKey } from "@/services/intake-mock";

type ReviewStatusFilter = ReviewStatusKey | "all";

const reviewStatusOptions: ReviewStatusKey[] = [
  "awaiting-review",
  "ai-ready",
  "ingestion",
  "workspace",
  "completed",
];

const statusBadgeVariantMap: Record<
  ReviewStatusKey,
  "default" | "success" | "warning" | "outline"
> = {
  "awaiting-review": "warning",
  "ai-ready": "default",
  ingestion: "default",
  workspace: "success",
  completed: "success",
};

const statusFilterDefinitions: { key: ReviewStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  ...reviewStatusOptions.map((key) => ({
    key,
    label: REVIEW_STATUS_LABELS[key],
  })),
];
export default function Home() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("all");
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);

  const intakeMilestones = [
    {
      title: "Questionnaire flow",
      summary: "Structure intake prompts and validation checkpoints",
      tasks: [
        "Outline sections for family history, asset inventory, decision makers",
        "Set required fields and contextual tooltips",
        "Map autosave cadence and draft preview triggers",
      ],
    },
    {
      title: "Voice capture placeholder",
      summary: "Simulate transcription ingest for demo purposes",
      tasks: [
        "Drop mock recording upload component",
        "Show transcript diff against structured fields",
        "Flag unresolved entities for lawyer review",
      ],
    },
    {
      title: "Summary handoff",
      summary: "Preview draft memo and export options",
      tasks: [
        "Render AI-generated summary with editable highlights",
        "Surface risk checklist before submission",
        "Expose download + send-to-workspace actions",
      ],
    },
  ];

  const workspaceHighlights = [
    {
      title: "Document workspace",
      points: [
        "Centralize drafts, source wills, and prior trust agreements",
        "Layer AI annotations for conflicting clauses and missing signatories",
        "Quick filters for case, client, and document lifecycle state",
      ],
    },
    {
      title: "Knowledge capture",
      points: [
        "Vectorize past case notes for retrieval-augmented drafting",
        "Tagged clause library for assets, guardianship, and distribution patterns",
        "Redaction tooling to maintain confidentiality in training docs",
      ],
    },
  ];

  const fallbackReviewQueue = [
    {
      id: "fallback-caldwell",
      title: "Estate transfer for Caldwell family",
      statusKey: "awaiting-review" as const,
      status: REVIEW_STATUS_LABELS["awaiting-review"],
      due: "Due in 2 days",
      owner: "Assign to Mathew",
    },
    {
      id: "fallback-patel",
      title: "Trust restructuring for Patel household",
      statusKey: "ai-ready" as const,
      status: REVIEW_STATUS_LABELS["ai-ready"],
      due: "Initial pass complete",
      owner: "Route to senior partner",
    },
    {
      id: "fallback-succession",
      title: "Succession plan audit",
      statusKey: "ingestion" as const,
      status: REVIEW_STATUS_LABELS.ingestion,
      due: "Synced 68% of archives",
      owner: "Monitor vector index build",
    },
  ];

  const updateReviewStatusMutation = useUpdateReviewQueueStatus();

  const {
    data: reviewItems,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useReviewQueue();

  const reviewQueue =
    reviewItems && reviewItems.length > 0 && !isReviewsError ? reviewItems : fallbackReviewQueue;

  const filteredReviewQueue = useMemo(() => {
    if (statusFilter === "all") {
      return reviewQueue;
    }
    return reviewQueue.filter((item) => item.statusKey === statusFilter);
  }, [reviewQueue, statusFilter]);

  const handleStatusChange = (itemId: string, statusKey: ReviewStatusKey) => {
    setPendingReviewId(itemId);
    updateReviewStatusMutation.mutate(
      {
        id: itemId,
        statusKey,
        status: REVIEW_STATUS_LABELS[statusKey],
      },
      {
        onSettled: () => {
          setPendingReviewId(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="bg-panel-strong rounded-panel border-soft/60 shadow-soft relative overflow-hidden border p-8">
          <div className="bg-accent/15 absolute top-[-20%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <Badge className="w-fit">Prototype sprint</Badge>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Align HNC’s intake, drafting, and review in a single intelligent console.
              </h1>
              <p className="text-ink-muted text-base sm:text-lg">
                We’re orchestrating agent workflows that capture client intent, surface relevant
                precedents, and accelerate legal review without compromising confidentiality.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary">Open next build checkpoint</Button>
              <Button variant="ghost">View roadmap</Button>
            </div>
            <dl className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-ink-muted text-xs tracking-[0.3em] uppercase">Next demo</dt>
                <dd className="text-ink text-lg font-semibold">Aug 7, 2025</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs tracking-[0.3em] uppercase">
                  Target accuracy
                </dt>
                <dd className="text-ink text-lg font-semibold">90% draft confidence</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs tracking-[0.3em] uppercase">
                  Admin time saved
                </dt>
                <dd className="text-success text-lg font-semibold">Projected 32%</dd>
              </div>
            </dl>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <header>
            <Badge variant="outline" className="mb-3">
              Today’s focus
            </Badge>
            <h2 className="text-xl font-semibold">Sprint board snapshot</h2>
            <p className="text-ink-muted text-sm">
              Anchor the prototype narrative before the August review.
            </p>
          </header>
          <ul className="flex flex-col gap-4 text-sm">
            <li className="border-soft/60 border-l-2 pl-4">
              Wireframe the guided intake wizard with progress, autosave indicators, and review
              step.
            </li>
            <li className="border-soft/60 border-l-2 pl-4">
              Prepare mock voice transcript to structured data alignment for demo walkthrough.
            </li>
            <li className="border-soft/60 border-l-2 pl-4">
              Draft success metrics slide: document turnaround time, lawyer adoption, auditability.
            </li>
          </ul>
        </Card>
      </section>

      <section
        id="intake"
        aria-labelledby="intake-heading"
        className="flex flex-col gap-6"
        role="region"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="intake-heading" className="text-2xl font-semibold">
              Client intake wizard
            </h2>
            <p className="text-ink-muted text-sm">
              Capture structured case data with blended voice and text inputs.
            </p>
          </div>
          <Badge variant="outline" className="tracking-[0.3em] uppercase">
            Sprint 1
          </Badge>
        </div>
        <div className="flex justify-end">
          <Link
            href="/intake"
            className="text-accent text-sm font-medium underline underline-offset-4"
          >
            Open interactive wizard →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {intakeMilestones.map((milestone) => (
            <Card key={milestone.title}>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">{milestone.title}</h3>
                <p className="text-ink-muted text-sm">{milestone.summary}</p>
                <ul className="text-ink-muted mt-2 space-y-2 text-sm">
                  {milestone.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2">
                      <span className="bg-accent mt-1 h-1.5 w-1.5 rounded-full" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="workspace"
        aria-labelledby="workspace-heading"
        className="grid gap-6 lg:grid-cols-[2fr,3fr]"
        role="region"
      >
        <Card className="h-full">
          <header className="flex flex-col gap-2">
            <h2 id="workspace-heading" className="text-2xl font-semibold">
              Document workspace
            </h2>
            <p className="text-ink-muted text-sm">
              Prepare the environment for AI-assisted drafting and clause intelligence.
            </p>
          </header>
          <div className="mt-6 flex flex-col gap-5">
            {workspaceHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-panel border-soft/70 border border-dashed p-4"
              >
                <h3 className="text-base font-semibold">{highlight.title}</h3>
                <ul className="text-ink-muted mt-3 space-y-2 text-sm">
                  {highlight.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="bg-accent mt-1 h-1.5 w-1.5 rounded-full" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Knowledge ingestion timeline</h2>
              <p className="text-ink-muted text-sm">Track data readiness for model fine-tuning.</p>
            </div>
            <Badge>Next sync</Badge>
          </header>
          <div className="flex flex-col gap-4 text-sm">
            <div className="rounded-panel border-soft/60 border p-4">
              <p className="text-ink-muted">Document normalization</p>
              <div className="bg-panel-strong mt-2 h-2 rounded-full">
                <div className="bg-accent h-full w-4/5 rounded-full" />
              </div>
              <p className="text-ink-muted mt-2 text-xs">82% of target corpus standardized</p>
            </div>
            <div className="rounded-panel border-soft/60 border p-4">
              <p className="text-ink-muted">Vector index build</p>
              <div className="bg-panel-strong mt-2 h-2 rounded-full">
                <div className="bg-accent-strong h-full w-2/3 rounded-full" />
              </div>
              <p className="text-ink-muted mt-2 text-xs">
                New clause tags ready for trust agreements
              </p>
            </div>
            <div className="rounded-panel border-soft/60 border p-4">
              <p className="text-ink-muted">PII audit trail</p>
              <div className="bg-panel-strong mt-2 h-2 rounded-full">
                <div className="h-full w-1/2 rounded-full bg-green-500" />
              </div>
              <p className="text-ink-muted mt-2 text-xs">
                Redaction policy draft shared for review
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section
        id="reviews"
        aria-labelledby="reviews-heading"
        className="flex flex-col gap-4"
        role="region"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="reviews-heading" className="text-2xl font-semibold">
              Review queue
            </h2>
            <Button variant="ghost" className="text-sm">
              Export summary
            </Button>
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Review queue filters"
          >
            {statusFilterDefinitions.map((filter) => (
              <Button
                key={filter.key}
                variant="ghost"
                className={clsx(
                  "text-xs",
                  statusFilter === filter.key
                    ? "bg-accent/10 text-accent"
                    : "text-ink-muted hover:text-ink",
                )}
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReviewQueue.length > 0
            ? filteredReviewQueue.map((item) => {
                const isUpdatingItem =
                  pendingReviewId === item.id && updateReviewStatusMutation.isPending;

                return (
                  <Card as="article" key={item.id} className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        <p className="text-ink-muted text-sm">{item.owner}</p>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {item.due}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusBadgeVariantMap[item.statusKey]}>{item.status}</Badge>
                      {isUpdatingItem ? (
                        <span className="text-ink-muted text-xs">Updating…</span>
                      ) : null}
                    </div>
                    <label
                      htmlFor={`status-${item.id}`}
                      className="text-ink-muted text-xs font-medium tracking-[0.2em] uppercase"
                    >
                      Status
                    </label>
                    <select
                      id={`status-${item.id}`}
                      className={clsx(
                        "border-soft/70 text-ink focus:ring-accent/40 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none",
                        isUpdatingItem && "opacity-60",
                      )}
                      value={item.statusKey}
                      onChange={(event) =>
                        handleStatusChange(item.id, event.target.value as ReviewStatusKey)
                      }
                      disabled={isUpdatingItem}
                    >
                      {reviewStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {REVIEW_STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </Card>
                );
              })
            : !isReviewsLoading && (
                <Card as="article" className="text-ink-muted text-sm">
                  No review items match this filter yet.
                </Card>
              )}

          {isReviewsLoading ? (
            <Card as="article" className="text-ink-muted text-sm">
              Loading review queue…
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
