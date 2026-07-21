import { cn } from "@/lib/cn";
import { statusLabel } from "@/content/site";

type ComingSoonBadgeProps = {
  className?: string;
};

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line bg-surface px-2 py-0.5",
        "text-[11px] font-medium uppercase tracking-[0.08em] text-muted",
        className,
      )}
    >
      {statusLabel}
    </span>
  );
}
