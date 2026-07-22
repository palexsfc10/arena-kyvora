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
  gestaoName: "Kyvora Gestão de Times",
  instagramHandle: "arenakyvora",
  instagramUrl: "https://www.instagram.com/arenakyvora",
} as const;

export const seo = {
  title: "Arena Kyvora — Encontre times e marque jogos amistosos",
  description:
    "Comunidade gratuita para times amadores se encontrarem, publicarem disponibilidade e organizarem desafios de futebol e futsal.",
  keywords: [
    "encontrar times para amistoso",
    "encontrar adversários futebol",
    "marcar jogos entre times",
    "times de futebol amador",
    "futsal amador",
    "jogos amistosos",
    "Arena Kyvora",
  ],
} as const;

export const navigation: NavItem[] = [
  { id: "funcionalidades", label: "Funcionalidades", href: "#funcionalidades" },
  { id: "como-funciona", label: "Como funciona", href: "#como-funciona" },
  { id: "ecossistema", label: "Ecossistema", href: "#ecossistema" },
];

export const hero = {
  eyebrow: "Gratuito para times amadores",
  title: "Seu próximo jogo começa aqui.",
  subtitle:
    "Publique a disponibilidade do seu time, encontre adversários e organize desafios — sem misturar com a gestão interna do clube.",
  primaryCta: {
    label: "Criar conta grátis",
    href: "/criar-conta",
    event: "cta_hero_criar_conta",
  },
  secondaryCta: {
    label: "Entrar",
    href: "/entrar",
    event: "cta_hero_entrar",
  },
  previewLabel: "O que você faz no Arena",
  previewItems: [
    { label: "Explorar", text: "Veja times disponíveis por cidade e modalidade." },
    { label: "Publicar", text: "Informe quando seu time pode jogar." },
    { label: "Desafiar", text: "Envie e responda desafios com data e local." },
  ],
} as const;

export const featuresIntro = {
  id: "funcionalidades",
  title: "Tudo para encontrar o próximo adversário",
  subtitle:
    "Ferramentas prontas para aproximar times amadores — sem reinventar o que você já organiza no Kyvora Gestão de Times.",
} as const;

export const features: FeatureItem[] = [
  {
    id: "encontrar-jogos",
    title: "Encontre jogos",
    description:
      "Descubra disponibilidades publicadas por outros times e filtre por modalidade, cidade e data.",
    icon: UserRoundSearch,
  },
  {
    id: "times-cidade",
    title: "Times por cidade",
    description:
      "Localize equipes pela cidade e modalidade informadas no perfil do time.",
    icon: MapPinned,
  },
  {
    id: "desafie",
    title: "Desafie outros times",
    description:
      "Envie e receba desafios para combinar confrontos com data, horário e local.",
    icon: Swords,
  },
  {
    id: "amistosos",
    title: "Organize amistosos",
    description:
      "Ajuste detalhes da partida, confirme propostas e acompanhe o status do desafio.",
    icon: CalendarClock,
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade do time",
    description:
      "Publique quando sua equipe está livre para jogar e apareça na exploração.",
    icon: MessageSquareShare,
  },
  {
    id: "perfil-time",
    title: "Perfil do time",
    description:
      "Apresente identidade, modalidade, cidade e descrição pública do time.",
    icon: UsersRound,
  },
  {
    id: "integracao",
    title: "Integração com o Kyvora",
    description:
      "Use a mesma conta e a mesma entidade de time do Kyvora Gestão de Times, sem duplicar cadastro.",
    icon: Link2,
  },
];

export const howItWorks = {
  id: "como-funciona",
  title: "Como funciona",
  subtitle: "Três passos do cadastro ao jogo.",
  steps: [
    {
      id: "cadastre",
      number: "01",
      title: "Cadastre seu time",
      description: "Crie a conta, vincule ou monte o time e ative a participação no Arena.",
    },
    {
      id: "publique",
      number: "02",
      title: "Publique e explore",
      description: "Informe disponibilidade e veja times prontos para jogar.",
    },
    {
      id: "desafie",
      number: "03",
      title: "Desafie e confirme",
      description: "Envie o desafio, combine os detalhes e confirme a partida.",
    },
  ] satisfies StepItem[],
} as const;

export const ecosystem = {
  id: "ecossistema",
  title: "Arena e Gestão de Times, no mesmo ecossistema",
  subtitleBefore:
    "O Arena aproxima times e cria oportunidades de jogos. O ",
  subtitleAfter: " organiza o time nos bastidores.",
  points: [
    {
      id: "arena",
      title: "Arena Kyvora",
      text: "Experiência gratuita para encontrar adversários e combinar amistosos.",
    },
    {
      id: "gestao",
      title: "Kyvora Gestão de Times",
      text: "Operação do time: elenco, partidas, estatísticas e finanças.",
    },
    {
      id: "dados",
      title: "Dados sob controle",
      text: "O dirigente define o que o time mostra publicamente no Arena.",
    },
  ],
} as const;

export const finalCta = {
  id: "comecar",
  title: "Entre em campo com o seu time.",
  subtitle:
    "O Arena Kyvora é gratuito. Crie sua conta, ative o perfil do time e comece a explorar adversários.",
  primaryLabel: "Criar conta grátis",
  primaryEvent: "cta_final_criar_conta",
  secondaryLabel: "Conhecer Kyvora Gestão de Times",
  secondaryEvent: "cta_final_gestao",
} as const;

export const footer = {
  legalNote: "Parte do ecossistema Kyvora.",
  links: [
    { id: "privacidade", label: "Política de Privacidade", href: "/privacidade" },
    { id: "termos", label: "Termos de Uso", href: "/termos" },
    { id: "contato", label: "Contato", href: "/contato" },
  ],
} as const;
