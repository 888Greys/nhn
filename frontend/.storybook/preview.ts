import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";
import { withAppProviders } from "./decorators";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  decorators: [withAppProviders],
};

export default preview;
