import { type ComponentPropsWithoutRef, type ElementType } from "react";
import clsx from "clsx";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends ElementType = "div">({ as, className, ...rest }: CardProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={clsx("bg-panel rounded-panel border-soft/70 shadow-soft border p-6", className)}
      {...rest}
    />
  );
}
