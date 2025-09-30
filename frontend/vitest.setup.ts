import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

type MockedNextImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
};

vi.mock("next/image", () => {
  return {
    default: React.forwardRef<HTMLImageElement, MockedNextImageProps>(
      ({ src, priority: _priority, ...rest }, ref) =>
        React.createElement("img", {
          ref,
          src: typeof src === "string" ? src : "",
          ...rest,
        }),
    ),
  };
});
