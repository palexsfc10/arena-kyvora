type ComingSoonBadgeProps = {
  className?: string;
};

/** Reserved for future gated features — not used on the public launch surface. */
export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      Em breve
    </span>
  );
}
