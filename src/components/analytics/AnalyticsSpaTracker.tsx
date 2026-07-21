"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Fires a single GA4 page_view per distinct SPA route (path + search).
 * Relies on gtag config send_page_view: false to avoid double hits.
 */
export function AnalyticsSpaTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}
