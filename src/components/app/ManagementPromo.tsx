"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, X } from "lucide-react";
import { brand } from "@/content/site";
import { env } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { buildGestaoManagementUrl } from "@/lib/gestao-cta";
import {
  dismissPromo,
  isPromoDismissed,
  markHighlightShownThisSession,
  type PromoSurface,
  wasHighlightShownThisSession,
} from "@/lib/promoPrefs";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export type ManagementPromoVariant = "login" | "explore" | "my_team";

type Copy = {
  title: string;
  body: string;
  cta: string;
};

const COPY: Record<ManagementPromoVariant, Copy> = {
  login: {
    title: "Seu time pode ir além",
    body: `Organize jogadores, estatísticas, temporadas e financeiro com o ${brand.gestaoName}.`,
    cta: `Conhecer o ${brand.gestaoName}`,
  },
  explore: {
    title: "Organize tudo além do jogo",
    body: "Jogadores, estatísticas, financeiro e temporadas em um só lugar.",
    cta: `Conhecer o ${brand.gestaoName}`,
  },
  my_team: {
    title: "Quer administrar seu time por completo?",
    body: "Controle jogadores, estatísticas, temporadas, mensalidades e despesas no Kyvora Gestão de Times.",
    cta: "Conhecer recursos",
  },
};

const SURFACE: Record<ManagementPromoVariant, PromoSurface> = {
  login: "login",
  explore: "explore",
  my_team: "my_team",
};

type ManagementPromoProps = {
  variant: ManagementPromoVariant;
  className?: string;
  /** Soften when a high-emphasis promo already showed this session. */
  demoteIfHighlightShown?: boolean;
};

function trackPromo(
  name: "kyvora_management_promo_viewed" | "kyvora_management_promo_clicked" | "kyvora_management_promo_dismissed",
  source: PromoSurface,
) {
  try {
    trackEvent(name, { source, origin: "arena" });
  } catch {
    // ignore
  }
}

/**
 * Contextual Gestão promo — never fixed, never over bottom nav.
 * Variants share dismiss prefs + analytics without identical layouts.
 */
export function ManagementPromo({
  variant,
  className,
  demoteIfHighlightShown = false,
}: ManagementPromoProps) {
  const href = buildGestaoManagementUrl(env.gestaoUrl, variant);
  const surface = SURFACE[variant];
  const copy = COPY[variant];
  const [visible, setVisible] = useState(false);
  const [soft, setSoft] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!href) return;
    if (isPromoDismissed(surface)) return;
    if (variant === "login" && wasHighlightShownThisSession()) return;
    setVisible(true);
    if (demoteIfHighlightShown && wasHighlightShownThisSession()) {
      setSoft(true);
    }
  }, [href, surface, variant, demoteIfHighlightShown]);

  useEffect(() => {
    if (!visible || viewedRef.current) return;
    viewedRef.current = true;
    trackPromo("kyvora_management_promo_viewed", surface);
    if (variant === "login") {
      markHighlightShownThisSession();
    }
  }, [visible, surface, variant]);

  if (!href || !visible) return null;

  function onDismiss() {
    dismissPromo(surface);
    setVisible(false);
    trackPromo("kyvora_management_promo_dismissed", surface);
  }

  function onClickCta() {
    trackPromo("kyvora_management_promo_clicked", surface);
    // Legacy alias for existing dashboards.
    try {
      trackEvent("paid_kyvora_cta_clicked", {
        placement: surface,
        viewport: variant === "login" ? "welcome" : "inline",
        origin: "arena",
      });
    } catch {
      // ignore
    }
  }

  const isLogin = variant === "login";
  const isMyTeam = variant === "my_team";

  return (
    <aside
      data-testid={variant === "explore" ? "gestao-promo-card" : `gestao-promo-${variant}`}
      data-promo-variant={variant}
      className={cn(
        "rounded-lg border p-4",
        isLogin && !soft && "border-sky-200/80 bg-sky-50/70",
        (variant === "explore" || soft) && "border-sky-100 bg-sky-50/40",
        isMyTeam && "border-sky-200/70 bg-sky-50/50",
        className,
      )}
      aria-label={copy.title}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-100/80 text-sky-800"
          aria-hidden
        >
          <Building2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-semibold text-ink">{copy.title}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Dispensar: ${copy.title}`}
              data-testid={
                variant === "explore"
                  ? "gestao-promo-dismiss"
                  : `gestao-promo-dismiss-${variant}`
              }
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">{copy.body}</p>
          <div className="mt-3">
            <Button
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="md"
              variant={isLogin && !soft ? "primary" : "outline"}
              className={cn(
                "w-full sm:w-auto",
                (isLogin && !soft) || isMyTeam
                  ? undefined
                  : "border-sky-200 bg-canvas text-ink hover:bg-sky-50",
              )}
              data-testid={
                variant === "explore" ? "gestao-promo-cta" : `gestao-promo-cta-${variant}`
              }
              data-analytics="kyvora_management_promo_clicked"
              onClick={onClickCta}
            >
              {copy.cta}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Back-compat alias used by Explorar. */
export function GestaoPromoCard({
  placement = "explore_after_third",
}: {
  placement?: string;
}) {
  void placement;
  return <ManagementPromo variant="explore" demoteIfHighlightShown />;
}
