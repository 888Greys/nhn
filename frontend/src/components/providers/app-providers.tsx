"use client";

import { type ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { DRAFT_QUERY_KEY, REVIEW_QUERY_KEY } from "@/hooks/use-intake-data";
import { subscribeToIntakeDraft, subscribeToReviewQueue } from "@/services/intake-mock";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    const unsubscribeDraft = subscribeToIntakeDraft((draft) => {
      queryClient.setQueryData(DRAFT_QUERY_KEY, draft);
    });

    const unsubscribeReviews = subscribeToReviewQueue((items) => {
      queryClient.setQueryData(REVIEW_QUERY_KEY, items);
    });

    return () => {
      unsubscribeDraft();
      unsubscribeReviews();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
    </QueryClientProvider>
  );
}
