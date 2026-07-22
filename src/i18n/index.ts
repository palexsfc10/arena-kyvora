/**
 * i18n preparation layer.
 * Current release ships Portuguese (Brazil) only.
 * Future locales can swap message modules without rewriting UI structure.
 */

export const defaultLocale = "pt-BR" as const;

export type Locale = typeof defaultLocale;

export { brand, seo, navigation, features, howItWorks, ecosystem, finalCta, footer, hero } from "@/content/site";
