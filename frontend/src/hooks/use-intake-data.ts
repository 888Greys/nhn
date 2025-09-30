import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchIntakeDraft,
  saveIntakeDraft,
  resetIntakeDraft,
  fetchReviewQueue,
  addReviewQueueItem,
  updateReviewQueueItemStatus,
  type IntakeDraft,
  type ReviewItem,
  type ReviewStatusKey,
} from "@/services/intake-mock";

export const DRAFT_QUERY_KEY = ["intake", "draft"] as const;
export const REVIEW_QUERY_KEY = ["intake", "reviews"] as const;

export function useIntakeDraft() {
  return useQuery<IntakeDraft>({
    queryKey: DRAFT_QUERY_KEY,
    queryFn: fetchIntakeDraft,
  });
}

export function useUpdateIntakeDraft() {
  const queryClient = useQueryClient();

  return useMutation<IntakeDraft, Error, Partial<IntakeDraft>, { previous?: IntakeDraft }>({
    mutationFn: saveIntakeDraft,
    onMutate: async (partial) => {
      await queryClient.cancelQueries({ queryKey: DRAFT_QUERY_KEY });
      const previous = queryClient.getQueryData<IntakeDraft>(DRAFT_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<IntakeDraft>(DRAFT_QUERY_KEY, {
          ...previous,
          ...partial,
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(DRAFT_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DRAFT_QUERY_KEY });
    },
  });
}

export function useResetIntakeDraft() {
  const queryClient = useQueryClient();

  return useMutation<IntakeDraft, Error, undefined>({
    mutationFn: resetIntakeDraft,
    onSuccess: (data) => {
      queryClient.setQueryData(DRAFT_QUERY_KEY, data);
    },
  });
}

export function useReviewQueue() {
  return useQuery<ReviewItem[]>({
    queryKey: REVIEW_QUERY_KEY,
    queryFn: fetchReviewQueue,
  });
}

export function useAddReviewQueueItem() {
  const queryClient = useQueryClient();

  return useMutation<ReviewItem[], Error, ReviewItem>({
    mutationFn: addReviewQueueItem,
    onSuccess: (items) => {
      queryClient.setQueryData(REVIEW_QUERY_KEY, items);
    },
  });
}

type ReviewUpdatePayload = {
  id: string;
  statusKey: ReviewStatusKey;
  status: string;
  owner?: string;
  due?: string;
};

export function useUpdateReviewQueueStatus() {
  const queryClient = useQueryClient();

  return useMutation<ReviewItem[], Error, ReviewUpdatePayload>({
    mutationFn: ({ id, ...updates }) =>
      updateReviewQueueItemStatus(id, {
        statusKey: updates.statusKey,
        status: updates.status,
        owner: updates.owner,
        due: updates.due,
      }),
    onSuccess: (items) => {
      queryClient.setQueryData(REVIEW_QUERY_KEY, items);
    },
  });
}
