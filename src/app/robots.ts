import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/privacidade",
        "/termos",
        "/entrar",
        "/criar-conta",
        "/verificar-email",
        "/verificacao-pendente",
        "/esqueci-senha",
        "/redefinir-senha",
        "/app",
        "/app/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
