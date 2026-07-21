"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { env } from "@/config/env";
import { Button } from "@/components/ui/Button";

const CONSENT_KEY = "arena-kyvora-analytics-consent";

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">(
    "unknown",
  );

  const analyticsReady =
    env.enableAnalytics &&
    Boolean(env.googleAnalyticsId || env.metaPixelId);

  useEffect(() => {
    if (!analyticsReady) return;
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [analyticsReady]);

  if (!analyticsReady) return null;

  const grant = () => {
    window.localStorage.setItem(CONSENT_KEY, "granted");
    setConsent("granted");
    setVisible(false);
  };

  const deny = () => {
    window.localStorage.setItem(CONSENT_KEY, "denied");
    setConsent("denied");
    setVisible(false);
  };

  return (
    <>
      {consent === "granted" && env.googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.googleAnalyticsId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {consent === "granted" && env.metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${env.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {visible ? (
        <div
          role="dialog"
          aria-label="Preferências de cookies e analytics"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-canvas p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:p-5"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted">
              Usamos analytics apenas com o seu consentimento, para entender o
              interesse no lançamento do Arena Kyvora. Você pode recusar.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" onClick={deny}>
                Recusar
              </Button>
              <Button onClick={grant}>Aceitar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
