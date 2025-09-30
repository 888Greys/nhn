type IntakeDraft = {
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

type ReviewStatusKey = "awaiting-review" | "ai-ready" | "ingestion" | "workspace" | "completed";

type ReviewItem = {
  id: string;
  title: string;
  status: string;
  statusKey: ReviewStatusKey;
  due: string;
  owner: string;
};

const REVIEW_STATUS_LABELS: Record<ReviewStatusKey, string> = {
  "awaiting-review": "Awaiting legal review",
  "ai-ready": "AI draft ready",
  ingestion: "Data ingestion running",
  workspace: "Workspace queued",
  completed: "Completed",
};

const initialDraft: IntakeDraft = {
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

const defaultReviewQueue: ReviewItem[] = [
  {
    id: "caldwell",
    title: "Estate transfer for Caldwell family",
    status: REVIEW_STATUS_LABELS["awaiting-review"],
    statusKey: "awaiting-review",
    due: "Due in 2 days",
    owner: "Assign to Mathew",
  },
  {
    id: "patel",
    title: "Trust restructuring for Patel household",
    status: REVIEW_STATUS_LABELS["ai-ready"],
    statusKey: "ai-ready",
    due: "Initial pass complete",
    owner: "Route to senior partner",
  },
  {
    id: "succession",
    title: "Succession plan audit",
    status: REVIEW_STATUS_LABELS.ingestion,
    statusKey: "ingestion",
    due: "Synced 68% of archives",
    owner: "Monitor vector index build",
  },
];

const DRAFT_STORAGE_KEY = "hnc:intake:draft";
const REVIEW_STORAGE_KEY = "hnc:intake:reviews";

let draftStore: IntakeDraft = { ...initialDraft };
let reviewQueueStore: ReviewItem[] = [...defaultReviewQueue];

type DraftListener = (draft: IntakeDraft) => void;
type ReviewListener = (items: ReviewItem[]) => void;

const draftListeners = new Set<DraftListener>();
const reviewListeners = new Set<ReviewListener>();

const isBrowser = typeof window !== "undefined";

const latency = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeParseJSON = <T>(raw: string | null, fallback: T): T => {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const persistDraftStore = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftStore));
};

const persistReviewQueueStore = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewQueueStore));
};

const notifyDraftListeners = () => {
  const snapshot = { ...draftStore };
  draftListeners.forEach((listener) => listener(snapshot));
};

const notifyReviewListeners = () => {
  const snapshot = reviewQueueStore.map((item) => ({ ...item }));
  reviewListeners.forEach((listener) => listener(snapshot));
};

if (isBrowser) {
  const storedDraft = safeParseJSON<Partial<IntakeDraft>>(
    window.localStorage.getItem(DRAFT_STORAGE_KEY),
    initialDraft,
  );
  draftStore = { ...initialDraft, ...storedDraft };

  const storedReviewQueue = safeParseJSON<ReviewItem[]>(
    window.localStorage.getItem(REVIEW_STORAGE_KEY),
    defaultReviewQueue,
  );
  if (storedReviewQueue.length === 0) {
    reviewQueueStore = [...defaultReviewQueue];
    persistReviewQueueStore();
  } else {
    reviewQueueStore = storedReviewQueue.map((item) => ({ ...item }));
  }

  if (!window.localStorage.getItem(DRAFT_STORAGE_KEY)) {
    persistDraftStore();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === DRAFT_STORAGE_KEY && typeof event.newValue === "string") {
      const parsed = safeParseJSON<Partial<IntakeDraft>>(event.newValue, initialDraft);
      draftStore = { ...initialDraft, ...parsed };
      notifyDraftListeners();
    }

    if (event.key === REVIEW_STORAGE_KEY && typeof event.newValue === "string") {
      const parsed = safeParseJSON<ReviewItem[]>(event.newValue, defaultReviewQueue);
      reviewQueueStore = parsed.map((item) => ({ ...item }));
      notifyReviewListeners();
    }
  });
}

export function subscribeToIntakeDraft(listener: DraftListener) {
  draftListeners.add(listener);
  return () => {
    draftListeners.delete(listener);
  };
}

export function subscribeToReviewQueue(listener: ReviewListener) {
  reviewListeners.add(listener);
  return () => {
    reviewListeners.delete(listener);
  };
}

export async function fetchIntakeDraft() {
  await latency(250);
  return { ...draftStore };
}

export async function saveIntakeDraft(partial: Partial<IntakeDraft>) {
  await latency(150);
  draftStore = { ...draftStore, ...partial };
  persistDraftStore();
  notifyDraftListeners();
  return { ...draftStore };
}

export async function resetIntakeDraft() {
  await latency(150);
  draftStore = { ...initialDraft };
  persistDraftStore();
  notifyDraftListeners();
  return { ...draftStore };
}

export async function fetchReviewQueue() {
  await latency(200);
  return reviewQueueStore.map((item) => ({ ...item }));
}

export async function addReviewQueueItem(item: ReviewItem) {
  await latency(180);
  const next = { ...item };
  const existingIndex = reviewQueueStore.findIndex((entry) => entry.id === item.id);

  if (existingIndex >= 0) {
    reviewQueueStore[existingIndex] = { ...reviewQueueStore[existingIndex], ...next };
  } else {
    reviewQueueStore = [next, ...reviewQueueStore];
  }

  persistReviewQueueStore();
  notifyReviewListeners();
  return reviewQueueStore.map((entry) => ({ ...entry }));
}

export async function updateReviewQueueItemStatus(
  id: string,
  updates: Partial<Pick<ReviewItem, "status" | "statusKey" | "owner" | "due">>,
) {
  await latency(150);
  reviewQueueStore = reviewQueueStore.map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );
  persistReviewQueueStore();
  notifyReviewListeners();
  return reviewQueueStore.map((entry) => ({ ...entry }));
}

export { REVIEW_STATUS_LABELS };
export type { IntakeDraft, ReviewItem, ReviewStatusKey };
