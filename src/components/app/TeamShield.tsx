import { cn } from "@/lib/cn";

type TeamShieldProps = {
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses: Record<"sm" | "md", string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-10 w-10 text-sm",
};

function initialsFor(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Compact shield/avatar for a team. Kept as a fixed-size box so long team
 * names (rendered separately by the caller) never distort the layout.
 */
export function TeamShield({ logoUrl, name, size = "md", className }: TeamShieldProps) {
  const safeName = name?.trim() || "Time";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface font-semibold text-ink-soft",
        sizeClasses[size],
        className,
      )}
      title={safeName}
      aria-hidden={logoUrl ? undefined : true}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`Escudo do time ${safeName}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initialsFor(safeName)}</span>
      )}
    </span>
  );
}
