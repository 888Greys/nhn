import { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "outline";

type BadgeProps = {
  variant?: BadgeVariant;
} & HTMLAttributes<HTMLSpanElement>;

const variants: Record<BadgeVariant, string> = {
  default: "bg-accent/10 text-accent",
  success: "bg-green-100 text-success",
  warning: "bg-yellow-100 text-warning",
  outline: "border border-soft text-ink-muted",
};

export function Badge({ className, variant = "default", ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
