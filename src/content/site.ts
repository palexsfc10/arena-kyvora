import {
  CalendarClock,
  MapPinned,
  MessageSquareShare,
  Swords,
  UserRoundSearch,
  UsersRound,
  Link2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "coming-soon";
};

export type StepItem = {
  id: string;
  number: string;
  title: string;
  description: string;
};

export const brand = {
  name: "Arena Kyvora",
  shortName: "Arena",
  tagline: "Encontre times. Marque jogos. Viva o esporte.",
  ecosystem: "Kyvora",
  gestaoName: "Kyvora Gestão",
} as const;

export const seo = {
  title: "Arena Kyvora — Encontre times e marque jogos amistosos",
  description:
    "Encontre times da sua região, desafie adversários e organize amistosos de futebol e futsal amador. Arena Kyvora: em breve.",
  keywords: [
    "encontrar times para amistoso",
    "encontrar adversários futebol",
    "marcar jogos entre times",
    "times de futebol amador",
    "futsal amador",
    "jogos amistosos na região",
    "Arena Kyvora",
  ],
} as const;

export const navigation: NavItem[] = [
  { id: "funcionalidades", label: "Funcionalidades", href: "#funcionalidades" },
  { id: "como-funcionara", label: "Como funcionará", href: "#como-funcionara" },
  { id: "ecossistema", label: "Ecossistema", href: "#ecossistema" },
];

export const hero = {
  eyebrow: "Em desenvolvimento",
  title: "Seu próximo jogo começa aqui.",
  subtitle:
    "Encontre times da sua região, descubra oportunidades de partidas e conecte seu time a novos adversários.",
  primaryCta: {
    label: "Conhecer funcionalidades",
    href: "#funcionalidades",
    event: "cta_hero_features",
  },
  secondaryCta: {
    label: "Acessar Kyvora Gestão",
    hrefKey: "gestao" as const,
    event: "cta_hero_gestao",
  },
  previewLabel: "Prévia conceitual",
  previewCaption: "Busca e desafios chegarão com o lançamento.",
} as const;

export const featuresIntro = {
  id: "funcionalidades",
  title: "Tudo para encontrar o próximo adversário",
  subtitle:
    "Recursos planejados para aproximar times amadores e viabilizar novos jogos — sem reinventar o que você já organiza no Kyvora Gestão.",
} as const;

export const features: FeatureItem[] = [
  {
    id: "encontrar-jogos",
    title: "Encontre jogos",
    description:
      "Descubra times disponíveis e oportunidades de partidas perto de você.",
    icon: UserRoundSearch,
    status: "coming-soon",
  },
  {
    id: "times-proximos",
    title: "Times próximos",
    description:
      "Localize equipes por cidade, região e modalidade.",
    icon: MapPinned,
    status: "coming-soon",
  },
  {
    id: "desafie",
    title: "Desafie outros times",
    description:
      "Envie e receba desafios para organizar novos confrontos.",
    icon: Swords,
    status: "coming-soon",
  },
  {
    id: "amistosos",
    title: "Organize amistosos",
    description:
      "Combine data, horário, local e detalhes da partida.",
    icon: CalendarClock,
    status: "coming-soon",
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade do time",
    description:
      "Informe quando sua equipe está disponível para jogar.",
    icon: MessageSquareShare,
    status: "coming-soon",
  },
  {
    id: "perfil-publico",
    title: "Perfil público",
    description:
      "Apresente identidade, elenco, jogos e estatísticas públicas do time.",
    icon: UsersRound,
    status: "coming-soon",
  },
  {
    id: "integracao",
    title: "Integração com o Kyvora",
    description:
      "Use as informações já cadastradas na gestão do time, sem duplicar o trabalho.",
    icon: Link2,
    status: "coming-soon",
  },
];

export const howItWorks = {
  id: "como-funcionara",
  title: "Como funcionará",
  subtitle: "Três passos simples do encontro ao jogo.",
  steps: [
    {
      id: "encontre",
      number: "01",
      title: "Encontre",
      description: "Localize times e oportunidades próximos de você.",
    },
    {
      id: "conecte",
      number: "02",
      title: "Conecte",
      description: "Envie um desafio e combine os detalhes da partida.",
    },
    {
      id: "jogue",
      number: "03",
      title: "Jogue",
      description:
        "Registre o jogo e construa a história pública do seu time.",
    },
  ] satisfies StepItem[],
} as const;

export const ecosystem = {
  id: "ecossistema",
  title: "Arena e Gestão, no mesmo ecossistema",
  subtitle:
    "O Arena aproxima times e cria oportunidades de jogos. O Kyvora Gestão organiza o time nos bastidores.",
  points: [
    {
      id: "arena",
      title: "Arena Kyvora",
      text: "Experiência pública para encontrar adversários e combinar amistosos.",
    },
    {
      id: "gestao",
      title: "Kyvora Gestão",
      text: "Operação do time: elenco, partidas, estatísticas e finanças.",
    },
    {
      id: "dados",
      title: "Dados sob controle",
      text: "Futuramente, o dirigente decide o que fica público no Arena.",
    },
  ],
} as const;

export const finalCta = {
  id: "acompanhar",
  title: "Prepare seu time para entrar em campo.",
  subtitle:
    "Acompanhe o lançamento do Arena Kyvora ou continue organizando seu time no Kyvora Gestão.",
  primaryLabel: "Acompanhar lançamento",
  primaryEvent: "cta_final_waitlist",
  secondaryLabel: "Conhecer Kyvora Gestão",
  secondaryEvent: "cta_final_gestao",
  waitlistPendingNote:
    "A captura de interesse ainda não está integrada. Configure NEXT_PUBLIC_WAITLIST_URL ou use o e-mail de contato.",
} as const;

export const footer = {
  legalNote: "Parte do ecossistema Kyvora.",
  links: [
    { id: "privacidade", label: "Política de Privacidade", href: "/privacidade" },
    { id: "termos", label: "Termos de Uso", href: "/termos" },
    { id: "contato", label: "Contato", href: "/contato" },
  ],
} as const;

export const statusLabel = "Em breve" as const;
