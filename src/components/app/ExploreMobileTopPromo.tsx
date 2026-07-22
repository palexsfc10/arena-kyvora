"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { brand } from "@/content/site";
import { env } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { buildGestaoManagementUrl } from "@/lib/gestao-cta";
import {
  dismissPromo,
  isPromoDismissed,
  PROMO_DISMISS_MS_MOBILE_TOP,
} from "@/lib/promoPrefs";
import { Button } from "@/components/ui/Button";

/**
 * Compact Gestão promo for Explorar — mobile only, below header / before title.
 * Dismiss cooldown: 3 days (shorter than other surfaces; Explorar is a high-intent funnel).
 */
export function ExploreMobileTopPromo() {
  const href = buildGestaoManagementUrl(env.gestaoUrl, {
    content: "top_promo",
    medium: "app",
    campaign: "mobile_explore",
  });
  const [visible, setVisible] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!href) return;
    if (isPromoDismissed("explore_mobile_top")) return;
    setVisible(true);
  }, [href]);

  useEffect(() => {
    if (!visible || viewedRef.current) return;
    viewedRef.current = true;
    try {
      trackEvent("kyvora_management_promo_viewed", {
        source: "explore_mobile_top",
        placement: "below_header",
        viewport: "mobile",
        origin: "arena",
      });
    } catch {
      // ignore
    }
  }, [visible]);

  if (!href || !visible) return null;

  function onDismiss() {
    dismissPromo("explore_mobile_top", PROMO_DISMISS_MS_MOBILE_TOP);
    setVisible(false);
    try {
      trackEvent("kyvora_management_promo_dismissed", {
        source: "explore_mobile_top",
        placement: "below_header",
        viewport: "mobile",
        origin: "arena",
      });
    } catch {
      // ignore
    }
  }

  function onClickCta() {
    try {
      trackEvent("kyvora_management_promo_clicked", {
        source: "explore_mobile_top",
        placement: "below_header",
        viewport: "mobile",
        origin: "arena",
      });
      trackEvent("paid_kyvora_cta_clicked", {
        placement: "explore_mobile_top",
        viewport: "mobile",
        origin: "arena",
      });
    } catch {
      // ignore
    }
  }

  return (
    <aside
      data-testid="gestao-promo-explore-mobile-top"
      data-promo-variant="explore_mobile_top"
      className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 md:hidden"
      aria-label={brand.gestaoName}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold leading-snug text-ink">
            {brand.gestaoName}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-sky-900/80">
            Gestão completa para seu time · 7 dias grátis
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-sky-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Dispensar ${brand.gestaoName}`}
          data-testid="gestao-promo-dismiss-explore-mobile-top"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <Button
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        size="md"
        className="mt-2.5 w-full justify-center"
        data-testid="gestao-promo-cta-explore-mobile-top"
        onClick={onClickCta}
      >
        Acessar
      </Button>
    </aside>
  );
}
