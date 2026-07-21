import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { env } from "@/config/env";
import { brand, seo } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brand.name,
  url: env.siteUrl,
  description: seo.description,
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: brand.ecosystem,
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#conteudo"
        className="absolute left-4 top-4 z-[70] -translate-y-[150%] rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Features />
        <HowItWorks />
        <Ecosystem />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
