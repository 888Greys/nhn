import type { Decorator } from "@storybook/react";
import { AppProviders } from "@/components/providers/app-providers";

export const withAppProviders: Decorator = (Story) => (
  <AppProviders>
    <Story />
  </AppProviders>
);
