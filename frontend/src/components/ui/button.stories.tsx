import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Continue",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "secondary", "ghost"],
    },
    isFullWidth: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const FullWidth: Story = {
  args: {
    variant: "primary",
    isFullWidth: true,
  },
};
