import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type ComponentType, type FormEvent } from "react";
import { createPortal } from "react-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { AnimatePresence, motion } from "framer-motion";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.js";
import Baby from "lucide-react/dist/esm/icons/baby.js";
import BedDouble from "lucide-react/dist/esm/icons/bed-double.js";
import Bone from "lucide-react/dist/esm/icons/bone.js";
import Brain from "lucide-react/dist/esm/icons/brain.js";
import Check from "lucide-react/dist/esm/icons/check.js";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
import ClipboardCheck from "lucide-react/dist/esm/icons/clipboard-check.js";
import Ear from "lucide-react/dist/esm/icons/ear.js";
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse.js";
import Hospital from "lucide-react/dist/esm/icons/hospital.js";
import Mail from "lucide-react/dist/esm/icons/mail.js";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle.js";
import Package from "lucide-react/dist/esm/icons/package.js";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Users from "lucide-react/dist/esm/icons/users.js";
import Wind from "lucide-react/dist/esm/icons/wind.js";
import X from "lucide-react/dist/esm/icons/x.js";

import Footer4Col from "@/components/ui/footer-column";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { MorphingText } from "@/components/ui/liquid-text";
import { Navbar1 } from "@/components/ui/navbar-1";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import {
  BLOG_COVER_ALT_MAX,
  BLOG_COVER_BUCKET,
  BLOG_CONTENT_HTML_MAX,
  blogPostSchema,
  BLOG_CONTENT_MAX,
  BLOG_INLINE_IMAGE_BUCKET,
  BLOG_TITLE_MAX,
  fetchPublishedPosts,
  getCoverImagePublicUrl,
  getInlineImagePublicUrl,
  isSupabaseConfigured,
  makeCoverImagePath,
  makeInlineImagePath,
  makeSlug,
  normalizeBlogInput,
  sanitizeBlogHtml,
  stripBlogMarkup,
  supabase,
  toExcerpt,
  type BlogPost,
} from "@/lib/blog";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/5511926913003";
const WHATSAPP_LOGO_SRC = "/brand/whatsapp-logo.svg";

interface ProductInfo {
  title: string;
  subtitle: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  details: string[];
}

interface SpecialtyItem {
  title: string;
  text: string;
  description: string;
}

interface SpecialtyGroup {
  group: string;
  icon: ComponentType<{ className?: string }>;
  items: SpecialtyItem[];
}

const journey = [
  {
    title: "Contato e agendamento",
    text: "A jornada começa com o contato do paciente ou familiar com a Evoluo. Nesse momento, esclarecemos dúvidas e organizamos o agendamento da avaliação inicial.",
  },
  {
    title: "Avaliação e plano terapêutico",
    text: "Realizamos uma avaliação criteriosa para compreender as necessidades do paciente e construir um plano terapêutico individualizado.",
  },
  {
    title: "Atendimento domiciliar",
    text: "O atendimento é realizado na residência do paciente, seguindo o plano terapêutico definido para sua necessidade.",
  },
  {
    title: "Acompanhamento e evolução",
    text: "A evolução é monitorada continuamente pela equipe assistencial e pela direção clínica, permitindo ajustes terapêuticos sempre que necessário.",
  },
];

const differentials = [
  {
    title: "Direção clínica ao longo de toda a jornada",
    text: "Cada paciente é acompanhado por uma estrutura clínica que garante alinhamento entre avaliação, plano terapêutico e evolução do tratamento.",
  },
  {
    title: "Um processo estruturado do início ao acompanhamento",
    text: "Da avaliação inicial ao acompanhamento contínuo, cada etapa segue um fluxo definido que proporciona mais clareza, organização e segurança para pacientes e familiares.",
  },
  {
    title: "Monitoramento contínuo da evolução",
    text: "Acompanhamos a evolução dos pacientes por meio de avaliações periódicas e acompanhamento constante da equipe assistencial.",
  },
  {
    title: "Equipe alinhada aos protocolos da Evoluo",
    text: "Todos os profissionais seguem diretrizes clínicas e processos definidos para garantir consistência, qualidade técnica e segurança assistencial.",
  },
  {
    title: "Integração entre equipe, médicos e familiares",
    text: "Promovemos uma comunicação próxima entre todos os envolvidos no cuidado para favorecer decisões mais seguras e alinhadas aos objetivos terapêuticos.",
  },
];

const SHOW_CLIENT_STORIES = false;

const team = [
  {
    name: "Mario Chueire Jr.",
    role: "Fisioterapeuta | Sócio-Diretor | Crefito 3-30491-F",
    imageSrc: "/team/mario.png",
    bio: "Especialista em Gerontologia e Sarcopenia, com mais de 14 anos de atuação no Hospital Sírio-Libanês. Possui pós-graduação em Fisioterapia Cardiorrespiratória pelo Instituto Dante Pazzanese de Cardiologia, pós-graduação em Gerontologia Clínica e Social pela UNIFESP, mestrado em Ciências da Saúde pela UNIFESP e título de Especialista em Gerontologia. Também possui formação em Musculoskeletal Ultrasound pela Harvard Medical School.",
  },
  {
    name: "Caroline Cabrelian",
    role: "Fisioterapeuta | Sócia-Diretora | Crefito 3-90036-F",
    imageSrc: "/team/carol.png",
    bio: "Fisioterapeuta com mais de 9 anos de atuação no Hospital Sírio-Libanês, integrando equipes do corpo clínico e assistencial. Possui pós-graduação em Fisioterapia em Doenças e Transplante de Fígado pelo HCFMUSP, aprimoramento em Gerontologia e Empreendedorismo pelo IEP Hospital Sírio-Libanês, título de Especialista em Fisioterapia Respiratória e MBA em Gestão e Inovação em Serviços em Saúde pela PUC-RS.",
  },
  {
    name: "Leandra Marques",
    role: "Fisioterapeuta | Sócia-Diretora | Crefito 3-109422-F",
    imageSrc: "/team/le.png",
    bio: "Fisioterapeuta com mais de 12 anos de atuação no Hospital Israelita Albert Einstein, com experiência no atendimento a pacientes críticos. Possui pós-graduação em Fisioterapia Respiratória pela UNIFESP, pós-graduação em Fisiologia do Exercício pela UNIFESP, mestrado em Ciências da Reabilitação Cardiopulmonar pela UNINOVE e MBA em Administração, Finanças e Criação de Valor pela PUC-RS.",
  },
];

const specialtyGroups: SpecialtyGroup[] = [
  {
    group: "Fisioterapia Ortopédica",
    icon: Bone,
    items: [
      {
        title: "Fisioterapia Ortopédica",
        text: "Mais movimento e menos limitações no dia a dia.",
        description:
          "Indicada para o tratamento de dores, lesões e limitações que afetam músculos, articulações, tendões e ligamentos, além da preparação e recuperação pós cirurgias ortopédicas.",
      },
    ],
  },
  {
    group: "Fisioterapia Neurológica",
    icon: Brain,
    items: [
      {
        title: "Fisioterapia Neurológica",
        text: "Mais funcionalidade e independência para as atividades diárias.",
        description:
          "Voltada para pessoas com condições neurológicas que afetam os movimentos, o equilíbrio ou a independência funcional, promovendo ganhos progressivos de mobilidade e funcionalidade.",
      },
    ],
  },
  {
    group: "Reabilitação Vestibular",
    icon: Ear,
    items: [
      {
        title: "Reabilitação Vestibular",
        text: "Mais equilíbrio e confiança para se movimentar.",
        description:
          "Indicada para pessoas que convivem com tonturas, vertigens ou alterações do equilíbrio, ajudando a reduzir sintomas e melhorar a estabilidade corporal.",
      },
    ],
  },
  {
    group: "Fisioterapia Pediátrica",
    icon: Baby,
    items: [
      {
        title: "Fisioterapia Pediátrica",
        text: "Cuidado especializado para cada fase do desenvolvimento infantil.",
        description:
          "Atendimento voltado para recém-nascidos, bebês, crianças e adolescentes com necessidades respiratórias, motoras ou neurológicas, respeitando as particularidades de cada etapa do desenvolvimento.",
      },
    ],
  },
  {
    group: "Fisioterapia Geriátrica",
    icon: Users,
    items: [
      {
        title: "Fisioterapia Geriátrica",
        text: "Mais mobilidade e qualidade de vida no envelhecimento.",
        description:
          "Atua na manutenção da força muscular, do equilíbrio, da mobilidade, do condicionamento físico e da funcionalidade, contribuindo para um envelhecimento mais ativo e seguro.",
      },
    ],
  },
  {
    group: "Fisioterapia nos Distúrbios do Sono",
    icon: BedDouble,
    items: [
      {
        title: "Fisioterapia nos Distúrbios do Sono",
        text: "Mais qualidade de sono e bem-estar.",
        description:
          "Abordagem fisioterapêutica para auxiliar no tratamento das condições como a Apneia Obstrutiva do Sono (AOS), diminuindo os riscos de doenças cardiovasculares e sonolência excessiva durante o dia.",
      },
    ],
  },
  {
    group: "Fisioterapia Respiratória",
    icon: Wind,
    items: [
      {
        title: "Fisioterapia Respiratória",
        text: "Mais conforto respiratório para o dia a dia.",
        description:
          "Indicada para pessoas com doenças respiratórias agudas ou crônicas, atuando na prevenção, tratamento e reabilitação de diversas condições respiratórias para melhorar a oxigenação, reduzir cansaço respiratórios e aumentar capacidade pulmonar e qualidade de vida.",
      },
    ],
  },
  {
    group: "Fisioterapia Pós-Alta Hospitalar",
    icon: Hospital,
    items: [
      {
        title: "Fisioterapia Pós-Alta Hospitalar",
        text: "Reabilitação segura após a internação.",
        description:
          "Auxilia na recuperação da força, da mobilidade e da capacidade pulmonar e funcional após internações hospitalares, favorecendo o retorno gradual às atividades diárias.",
      },
    ],
  },
  {
    group: "Fisioterapia Cardiopulmonar e Metabólica",
    icon: HeartPulse,
    items: [
      {
        title: "Fisioterapia Cardiopulmonar e Metabólica",
        text: "Mais condicionamento e capacidade funcional.",
        description:
          "Indicada para pessoas em recuperação de condições cardíacas, pulmonares ou metabólicas, ajudando a melhorar o condicionamento físico e a resistência para as atividades do dia a dia.",
      },
    ],
  },
];

const rentalProducts: ProductInfo[] = [
  {
    title: "BiPAP (AirSense 10)",
    subtitle: "Suporte respiratório com mais conforto e segurança.",
    description:
      "Equipamento utilizado para auxiliar pacientes que necessitam de ventilação não invasiva, contribuindo para uma respiração mais eficiente e confortável durante o tratamento domiciliar.",
    imageSrc: "/products/bipap-airsense-10.png",
    imageAlt: "BiPAP AirSense 10",
    details: [
      "Equipamento de ventilação não invasiva",
      "Ajustes individualizados conforme necessidade clínica",
      "Compatível com máscaras específicas para terapia respiratória",
      "Utilização domiciliar mediante orientação profissional",
    ],
  },
  {
    title: "VPAP S9",
    subtitle: "Suporte respiratório com mais conforto e segurança.",
    description:
      "Equipamento utilizado para auxiliar pacientes que necessitam de ventilação não invasiva, contribuindo para uma respiração mais eficiente e confortável durante o tratamento domiciliar.",
    imageSrc: "/products/vpap-s9.png",
    imageAlt: "VPAP S9",
    details: [
      "Equipamento de ventilação não invasiva",
      "Ajustes individualizados conforme necessidade clínica",
      "Compatível com acessórios específicos para terapia respiratória",
      "Utilização domiciliar mediante orientação profissional",
    ],
  },
  {
    title: "Smart Cycle",
    subtitle: "Movimento assistido para apoiar a recuperação funcional.",
    description:
      "Equipamento utilizado em processos de reabilitação para estimular movimentos dos braços e pernas, auxiliando na manutenção da mobilidade, condicionamento físico e recuperação funcional.",
    imageSrc: "/products/smart-cycle.png",
    imageAlt: "Smart Cycle para reabilitação motora assistida",
    details: [
      "Exercícios passivos, ativos e assistidos, identificação de espasmos",
      "Utilização para membros superiores e inferiores",
      "Intensidade ajustável, feedback visual, gameficação",
      "Indicado para reabilitação neurológica, ortopédica e geriátrica",
    ],
  },
  {
    title: "Hypershell X Series",
    subtitle: "Exoesqueleto leve para suporte à mobilidade.",
    description:
      "Equipamento de assistência motora utilizado para apoiar deslocamentos e atividades funcionais, oferecendo suporte mecânico durante o uso supervisionado.",
    imageSrc: "/products/hypershell-x-series.png",
    imageAlt: "Exoesqueleto Hypershell X Series",
    details: [
      "Exoesqueleto robótico para suporte de marcha",
      "Estrutura leve e ajustável ao corpo",
      "Modos inteligentes de assistência ao movimento",
      "Utilização domiciliar mediante orientação profissional",
    ],
  },
];

const saleProducts: ProductInfo[] = [
  {
    title: "Circuito para CPAP e BiPAP",
    subtitle: "Conexão segura para terapias respiratórias.",
    description:
      "Componente utilizado para conectar o equipamento respiratório à interface utilizada pelo paciente, contribuindo para a eficiência da terapia.",
    imageSrc: "/products/circuito-cpap-bipap.png",
    imageAlt: "Circuito para CPAP e BiPAP",
    details: [
      "Traqueia flexível 22 mm × 1,80 m",
      "Compatível com equipamentos CPAP, BiPAP e VPAP",
      "Maior flexibilidade durante o uso",
      "Produto registrado na Anvisa",
    ],
  },
  {
    title: "Válvula Exalatória",
    subtitle: "Segurança durante a ventilação não invasiva.",
    description:
      "Acessório responsável por auxiliar a eliminação adequada do ar expirado durante a terapia respiratória em interfaces não ventiladas.",
    imageSrc: "/products/valvula-exalatoria.png",
    imageAlt: "Válvula exalatória para BiPAP e CPAP",
    details: [
      "Válvula exalatória de CO₂",
      "Reutilizável",
      "Compatível com diferentes equipamentos respiratórios",
      "Registro Anvisa 80677040003",
    ],
  },
  {
    title: "Máscara de BiPAP (Coxim Inflável)",
    subtitle: "Vedação eficiente e mais conforto durante a terapia.",
    description:
      "Desenvolvida para proporcionar adaptação adequada e conforto ao paciente durante a utilização dos equipamentos respiratórios.",
    imageSrc: "/products/mascara-bipap-coxim-inflavel.png",
    imageAlt: "Máscara de BiPAP com coxim inflável",
    details: [
      "Almofada inflável em PVC",
      "Diferentes tamanhos para neonatos, crianças e adultos",
      "Compatível com equipamentos de ventilação não invasiva",
      "Registro Anvisa/MS 80171530009",
    ],
  },
  {
    title: "Máscara Yuwell",
    subtitle: "Adaptação confortável para diferentes perfis de pacientes.",
    description:
      "Indicada para utilização em terapias respiratórias não invasivas, favorecendo conforto e estabilidade durante o tratamento e prevenindo lesões de pele na face.",
    imageSrc: "/products/mascara-yuwell.png",
    imageAlt: "Máscara Yuwell para terapia respiratória",
    details: [
      "Diferentes tamanhos disponíveis com borda siliconada",
      "Ajuste anatômico com prevenção de lesões de pele",
      "Compatível com equipamentos de ventilação não invasiva",
    ],
  },
  {
    title: "Máscara DreamLive Facial YF-03",
    subtitle: "Estabilidade e vedação para maior conforto durante a terapia.",
    description:
      "Máscara facial desenvolvida para proporcionar adaptação eficiente, segurança durante o tratamento respiratório e prevenindo lesões de pele na face.",
    imageSrc: "/products/mascara-dreamlive-facial-yf-03.png",
    imageAlt: "Máscara DreamLive Facial YF-03",
    details: [
      "Almofadas P, M e G inclusas (3 em 1)",
      "Apoio de testa para maior sustentação",
      "Conector para suplementação de oxigênio",
      "Cotovelo giratório 360°",
      "Sistema de conexão rápida",
      "Fácil higienização",
    ],
  },
  {
    title: "Shaker Classic",
    subtitle: "Auxílio na mobilização de secreções respiratórias.",
    description:
      "Dispositivo utilizado na fisioterapia respiratória para contribuir com a higiene brônquica e facilitar a eliminação de secreções.",
    imageSrc: "/products/shaker-classic.png",
    imageAlt: "Shaker Classic para fisioterapia respiratória",
    details: [
      "Oscilação oral de alta frequência",
      "Auxilia na mobilização de secreções pulmonares",
      "Produto portátil e higienizável",
    ],
  },
  {
    title: "Respiron Classic",
    subtitle: "Incentivador respiratório.",
    description:
      "Equipamento utilizado para estimular inspirações profundas e auxiliar na ventilação pulmonar.",
    imageSrc: "/products/respiron-classic.png",
    imageAlt: "Respiron Classic incentivador respiratório",
    details: [
      "Incentivador respiratório",
      "Três níveis progressivos de treinamento",
      "Indicado para pré e pós-operatório",
      "Auxilia pacientes com doenças pulmonares",
    ],
  },
];

const fallbackPosts = [
  "Influenza e o Sistema Respiratório: Como a Fisioterapia Domiciliar Evita Complicações e Internações",
  "O Desequilíbrio na Terceira Idade: Como a Fisioterapia Gerontológica Domiciliar Previne Quedas e Preserva a Independência",
  "Pós-Alta de Artroplastia de Quadril: O Papel Crucial da Fisioterapia Domiciliar no Retorno Seguro à Rotina",
];

function SectionHeading({
  title,
  text,
  className,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <span className={cn("section-accent-line", light && "is-light")} aria-hidden="true" />
      <h2 className={cn("font-display text-balance text-4xl font-semibold tracking-normal sm:text-5xl", light ? "text-brand-creme" : "text-brand-ink")}>
        {title}
      </h2>
      {text ? <p className={cn("mt-5 text-lg leading-8", light ? "text-brand-creme/72" : "text-brand-ink/65")}>{text}</p> : null}
    </Reveal>
  );
}

function SpecialtyCard({
  item,
  index,
  onClick,
}: {
  item: SpecialtyGroup;
  index: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layoutId={`specialty-card-${index}`}
      className="specialty-card group rounded-lg border bg-white/70 p-5 text-left text-brand-ink transition duration-300"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-haspopup="dialog"
    >
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-7 w-7 text-brand-lime transition" />
        <ArrowRight className="h-5 w-5 text-brand-lime transition group-hover:translate-x-1" />
      </div>
      <h3 className="mt-8 font-display text-xl font-semibold tracking-normal">{item.group}</h3>
      <p className="mt-3 text-sm leading-6 text-brand-ink/60 transition group-hover:text-brand-ink/68">
        {item.items[0].text}
      </p>
    </motion.button>
  );
}

function SpecialtyModal({
  item,
  index,
  onClose,
}: {
  item: SpecialtyGroup;
  index: number;
  onClose: () => void;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      className="specialty-modal fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="specialty-modal-title"
    >
      <motion.button
        className="absolute inset-0 bg-brand-petroleum/60 backdrop-blur-sm"
        type="button"
        onClick={onClose}
        aria-label="Fechar especialidade"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        layoutId={`specialty-card-${index}`}
        className="specialty-modal-panel relative z-10 grid max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-lg border border-brand-petroleum/20 bg-brand-creme text-brand-ink shadow-2xl"
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="specialty-modal-header flex items-start justify-between gap-6 border-b border-brand-petroleum/15 p-6 sm:p-8">
          <div className="specialty-modal-title-wrap flex items-center gap-4">
            <Icon className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
            <h3 id="specialty-modal-title" className="specialty-modal-title font-display text-3xl font-semibold tracking-normal sm:text-5xl">
              {item.group}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-petroleum/20 transition hover:bg-brand-petroleum hover:text-brand-creme"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="specialty-modal-body overflow-y-auto p-6 sm:p-8">
          <div className="specialty-modal-content max-w-3xl space-y-8">
            {item.items.map((specialty, specialtyIndex) => (
              <motion.div
                key={specialty.title}
                className="specialty-modal-copy space-y-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + specialtyIndex * 0.05, duration: 0.35 }}
              >
                <p className="text-xl font-medium leading-9 text-brand-ink/75">{specialty.text}</p>
                <p className="text-lg leading-8 text-brand-ink/65">{specialty.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductCard({ product, onRequestQuote }: { product: ProductInfo; onRequestQuote: () => void }) {
  return (
    <details
      id={`product-${makeSlug(product.title)}`}
      className="product-card group rounded-lg border bg-white/65 p-5 transition"
    >
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <span>
            <span className="block font-display text-lg font-semibold text-brand-ink">{product.title}</span>
            <span className="mt-2 block text-sm leading-6 text-brand-ink/60">{product.subtitle}</span>
          </span>
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 transition group-open:rotate-180" />
        </div>
        {product.imageSrc ? (
          <div className="product-image-wrap">
            <img src={product.imageSrc} alt={product.imageAlt ?? product.title} className="product-image" loading="lazy" />
          </div>
        ) : null}
      </summary>
      <p className="mt-5 border-t border-brand-petroleum/10 pt-5 text-sm leading-6 text-brand-ink/65">{product.description}</p>
      <ul className="mt-4 space-y-3">
        {product.details.map((detail) => (
          <li key={detail} className="flex gap-3 text-sm leading-6 text-brand-ink/65">
            <Check className="mt-1 h-4 w-4 shrink-0 text-brand-lime" />
            {detail}
          </li>
        ))}
      </ul>
      <button type="button" className="product-quote-button" onClick={onRequestQuote}>
        <span>Solicitar orçamento</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </button>
    </details>
  );
}

function ProductDrawer({
  title,
  description,
  products,
  icon: Icon,
  targetProductTitle,
  isClosing = false,
  onClose,
  onRequestQuote,
}: {
  title: string;
  description: string;
  products: ProductInfo[];
  icon: ComponentType<{ className?: string }>;
  targetProductTitle?: string | null;
  isClosing?: boolean;
  onClose: () => void;
  onRequestQuote: () => void;
}) {
  useEffect(() => {
    document.body.classList.add("product-drawer-open");

    return () => {
      document.body.classList.remove("product-drawer-open");
    };
  }, []);

  useEffect(() => {
    if (!targetProductTitle) return;

    const timeout = window.setTimeout(() => {
      const productElement = document.getElementById(`product-${makeSlug(targetProductTitle)}`);
      if (productElement instanceof HTMLDetailsElement) {
        productElement.open = true;
      }
      productElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 460);

    return () => window.clearTimeout(timeout);
  }, [targetProductTitle]);

  return (
    <div
      className={cn("product-drawer fixed inset-0 z-[9999]", isClosing && "is-closing")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-drawer-title"
      style={{ zIndex: 9999 }}
    >
      <button
        type="button"
        className="product-drawer-backdrop"
        onClick={onClose}
        aria-label="Fechar painel de produtos"
      />
      <div
        className="product-drawer-panel"
      >
        <div className="product-drawer-header">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-brand-lime" />
            <h3 id="product-drawer-title" className="font-display text-2xl font-semibold tracking-normal text-brand-ink">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-petroleum/20 transition hover:bg-brand-petroleum hover:text-brand-creme"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="product-drawer-body">
          <p className="text-base leading-7 text-brand-ink/65">{description}</p>
          <div className="mt-8 space-y-4">
            {products.map((product) => (
              <ProductCard key={product.title} product={product} onRequestQuote={onRequestQuote} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyTimeline() {
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const startPoint = viewportHeight * 0.72;
      const travelDistance = Math.max(1, rect.height - viewportHeight * 0.28);
      const progress = Math.min(1, Math.max(0, (startPoint - rect.top) / travelDistance));

      timeline.style.setProperty("--journey-progress", progress.toFixed(4));
    };

    const requestProgressUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, []);

  return (
    <div ref={timelineRef} className="journey-timeline">
      <span className="journey-timeline-track" aria-hidden="true" />
      <span className="journey-timeline-fill" aria-hidden="true" />
      {journey.map((step, index) => (
        <Reveal
          key={step.title}
          delay={index * 0.08}
          className={cn("journey-step", index % 2 === 0 ? "is-left" : "is-right")}
        >
          <article className="journey-step-card">
            <span className="journey-step-number">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

function HeroImageCollage() {
  return (
    <div className="hero-collage order-2" aria-hidden="true">
      <img className="hero-collage-image hero-collage-image-main" src="/hero/fisio1.png" alt="" />
      <img className="hero-collage-image hero-collage-image-right" src="/hero/fisio2.png" alt="" />
      <img className="hero-collage-image hero-collage-image-left" src="/hero/fisio3.png" alt="" />
    </div>
  );
}

function TeamShowcase() {
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
  const teamHistoryPushedRef = useRef(false);
  const ignoreNextTeamPopRef = useRef(false);
  const activeMember = activeMemberIndex === null ? null : team[activeMemberIndex];

  function openTeamMember(index: number) {
    if (!teamHistoryPushedRef.current) {
      window.history.pushState({ evoluoTeamModal: true }, "", window.location.href);
      teamHistoryPushedRef.current = true;
    }

    setActiveMemberIndex(index);
  }

  function closeTeamMember(syncHistory = true) {
    setActiveMemberIndex(null);

    if (syncHistory && teamHistoryPushedRef.current) {
      ignoreNextTeamPopRef.current = true;
      teamHistoryPushedRef.current = false;
      window.history.back();
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextTeamPopRef.current) {
        ignoreNextTeamPopRef.current = false;
        return;
      }

      if (activeMemberIndex === null) return;

      teamHistoryPushedRef.current = false;
      closeTeamMember(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeMemberIndex]);

  useEffect(() => {
    if (activeMemberIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTeamMember();
    };

    document.body.style.overflow = "hidden";
    document.body.classList.add("team-modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("team-modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMemberIndex]);

  return (
    <Reveal className="mx-auto w-full max-w-[980px] text-center">
      <span className="section-accent-line" aria-hidden="true" />
      <h3 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-normal text-brand-ink sm:text-5xl">
        Direção clínica, experiência e visão integrada do cuidado.
      </h3>
      <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-8 text-brand-ink/65">
        A Evoluo é conduzida por profissionais com sólida experiência em hospitais de referência, reabilitação e
        atendimento domiciliar. Nossa gestão acompanha de perto os processos clínicos, o desenvolvimento da equipe
        e a evolução dos pacientes, garantindo alinhamento técnico, segurança assistencial e qualidade no cuidado.
      </p>

      <div className="mx-auto mt-14 grid max-w-[860px] justify-items-center gap-10 md:grid-cols-3">
        {team.map((member, index) => (
          <button
            key={member.name}
            type="button"
            onClick={() => openTeamMember(index)}
            className="team-avatar-button group"
            aria-haspopup="dialog"
          >
            <span className="team-avatar-shell">
              <img src={member.imageSrc} alt="" className="team-avatar-image" />
            </span>
            <span className="mt-6 block font-display text-xl font-semibold text-brand-ink">{member.name}</span>
            <span className="mx-auto mt-2 block max-w-[15rem] text-sm leading-6 text-brand-ink/55">
              {member.role}
            </span>
          </button>
        ))}
      </div>

      <div className="team-assist-card mx-auto mt-14 max-w-[860px] rounded-lg border bg-white/35 p-5 text-left shadow-[0_18px_60px_rgba(213,227,112,0.12)]">
        <div className="grid gap-4 md:grid-cols-[0.65fr_1.35fr] md:items-start">
          <div className="flex items-center gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand-lime" />
            <h3 className="font-display text-xl font-semibold text-brand-ink">Equipe Assistencial</h3>
          </div>
          <p className="text-sm leading-7 text-brand-ink/65">
            Nossa equipe é formada por fisioterapeutas selecionados, treinados e alinhados aos protocolos clínicos da
            Evoluo. Todos os profissionais atuam sob acompanhamento da direção clínica e seguem processos assistenciais
            definidos para garantir consistência, qualidade técnica e segurança em toda a jornada de cuidado.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {activeMember ? (
          <TeamMemberModal member={activeMember} onClose={() => closeTeamMember()} />
        ) : null}
      </AnimatePresence>
    </Reveal>
  );
}

function TeamMemberModal({ member, onClose }: { member: (typeof team)[number]; onClose: () => void }) {
  return createPortal(
    <div className="team-modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title">
      <button type="button" className="team-modal-backdrop" onClick={onClose} aria-label="Fechar currículo" />
      <div className="team-modal-content">
        <button type="button" className="team-modal-close" onClick={onClose} aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
        <div className="team-modal-photo-wrap">
          <img src={member.imageSrc} alt="" className="team-modal-photo" />
        </div>
        <div className="team-modal-card">
          <h4 id="team-modal-title" className="font-display text-3xl font-semibold text-brand-ink">
            {member.name}
          </h4>
          <p className="mt-2 text-sm font-medium leading-6 text-brand-petroleum">{member.role}</p>
          <p className="mt-6 text-base leading-8 text-brand-ink/70">{member.bio}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BlogSection() {
  const [publishedPosts, setPublishedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setIsLoading(true);
      const data = await fetchPublishedPosts(3);
      if (isMounted) {
        setPublishedPosts(data);
        setIsLoading(false);
      }
    }

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="blog" className="section-padding">
      <div className="container">
        <SectionHeading
          eyebrow="Blog"
          title="Conteúdo e informação para apoiar a sua jornada de cuidado."
          text="Acreditamos que informação de qualidade também faz parte do processo de cuidado. Por isso, compartilhamos conteúdos produzidos pela equipe da Evoluo sobre reabilitação, prevenção, recuperação funcional e qualidade de vida, ajudando pacientes, familiares e cuidadores a compreender melhor cada etapa da jornada de saúde."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {publishedPosts.length > 0
            ? publishedPosts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.07} className="blog-card rounded-lg border bg-white/55 p-4">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.cover_image_alt ?? ""} className="blog-card-cover" loading="lazy" />
                  ) : (
                    <BlogCardCoverPlaceholder />
                  )}
                  <div className="p-1 pt-5">
                    <h3 className="font-display text-xl font-semibold leading-7 tracking-normal text-brand-ink">{post.title}</h3>
                    <p className="blog-excerpt mt-4 text-sm leading-6 text-brand-ink/60">{toExcerpt(post.content)}</p>
                    <a href={`/blog/${post.slug}`} className="mt-8 inline-flex items-center text-sm font-semibold text-brand-petroleum decoration-brand-lime underline-offset-4 hover:underline">
                      Ler artigo
                      <ArrowRight className="ml-2 h-4 w-4 text-brand-lime" />
                    </a>
                  </div>
                </Reveal>
              ))
            : fallbackPosts.map((post, index) => (
                <Reveal key={post} delay={index * 0.07} className="blog-card rounded-lg border bg-white/55 p-4">
                  <BlogCardCoverPlaceholder />
                  <div className="p-1 pt-5">
                    <h3 className="font-display text-xl font-semibold leading-7 tracking-normal text-brand-ink">{post}</h3>
                    <p className="blog-excerpt mt-4 text-sm leading-6 text-brand-ink/60">
                      {isLoading ? "Carregando artigos publicados..." : "Área preparada para os próximos conteúdos da Evoluo."}
                    </p>
                    <a href="#contato" className="mt-8 inline-flex items-center text-sm font-semibold text-brand-petroleum decoration-brand-lime underline-offset-4 hover:underline">
                      Em breve
                      <ArrowRight className="ml-2 h-4 w-4 text-brand-lime" />
                    </a>
                  </div>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

function BlogCardCoverPlaceholder() {
  return (
    <div className="blog-card-cover-placeholder" aria-hidden="true">
      <span className="blog-card-cover-mark">EV</span>
      <span className="blog-card-cover-line" />
    </div>
  );
}

function BlogPostCoverPlaceholder() {
  return (
    <div className="blog-post-cover-placeholder" aria-hidden="true">
      <span className="blog-card-cover-mark">EV</span>
      <span className="blog-card-cover-line" />
    </div>
  );
}

type BlogFormState = {
  title: string;
  content: string;
  cover_image_path: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
};

const emptyBlogForm: BlogFormState = {
  title: "",
  content: "",
  cover_image_path: null,
  cover_image_url: null,
  cover_image_alt: null,
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https:\/\/[^)\s]{1,300}\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]{1,300})\)$/);
    if (linkMatch) {
      return (
        <a key={`${part}-${index}`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="font-semibold text-brand-petroleum underline underline-offset-4">
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

function BlogContent({ content }: { content: string }) {
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(content) }} />;
  }

  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={block} className="pt-4 font-display text-2xl font-semibold leading-tight text-brand-ink">
              {renderInlineMarkdown(block.slice(3))}
            </h2>
          );
        }

        const listItems = block
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2));

        if (listItems.length > 0 && listItems.length === block.split("\n").filter(Boolean).length) {
          return (
            <ul key={block} className="list-disc space-y-2 pl-5">
              {listItems.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={block}>{renderInlineMarkdown(block)}</p>;
      })}
    </>
  );
}

const quillModules = {
  toolbar: [
    [{ header: [false, 2, 3] }],
    ["bold", "italic", "blockquote"],
    [{ list: "bullet" }, { list: "ordered" }],
    ["link", "image", "clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const quillFormats = ["header", "bold", "italic", "blockquote", "list", "bullet", "link", "image"];

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const quillRef = useRef<ReactQuill | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const [inlineImageMessage, setInlineImageMessage] = useState("");
  const [isInlineImageUploading, setIsInlineImageUploading] = useState(false);

  const modules = useMemo(
    () => ({
      ...quillModules,
      toolbar: {
        container: quillModules.toolbar,
        handlers: {
          image: () => {
            setInlineImageMessage("");
            inlineImageInputRef.current?.click();
          },
        },
      },
    }),
    [],
  );

  async function handleInlineImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setInlineImageMessage("");
    if (!file || !supabase) return;

    if (!(await isAllowedImageFile(file))) {
      setInlineImageMessage("Envie uma imagem JPG, PNG ou WEBP com até 8MB.");
      return;
    }

    const sourceUrl = URL.createObjectURL(file);
    setIsInlineImageUploading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userError || !userId) throw new Error("Sessão inválida.");

      const blob = await makeCroppedCoverBlob(sourceUrl, 1, 0, 0);
      if (blob.size > 3 * 1024 * 1024) throw new Error("A imagem processada ficou muito pesada.");

      const path = makeInlineImagePath(userId);
      const { error } = await supabase.storage.from(BLOG_INLINE_IMAGE_BUCKET).upload(path, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) throw error;

      const editor = quillRef.current?.getEditor();
      if (!editor) throw new Error("Editor indisponível.");

      const publicUrl = getInlineImagePublicUrl(path);
      const selection = editor.getSelection(true);
      const index = selection?.index ?? editor.getLength();
      editor.insertEmbed(index, "image", publicUrl, "user");
      editor.insertText(index + 1, "\n", "user");
      editor.setSelection(index + 2, 0, "silent");
      setInlineImageMessage("Imagem inserida no texto.");
    } catch {
      setInlineImageMessage("Não foi possível inserir a imagem. Use uma imagem horizontal com pelo menos 800x450px.");
    } finally {
      URL.revokeObjectURL(sourceUrl);
      setIsInlineImageUploading(false);
    }
  }

  return (
    <div className="blog-editor blog-quill-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        modules={modules}
        formats={quillFormats}
        preserveWhitespace
        placeholder="Escreva o conteúdo do blog aqui..."
        onChange={(content) => {
          onChange(content.slice(0, BLOG_CONTENT_HTML_MAX));
        }}
      />
      <input
        ref={inlineImageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="blog-inline-image-input"
        onChange={handleInlineImageChange}
      />
      {isInlineImageUploading || inlineImageMessage ? (
        <p className="blog-inline-image-message">
          {isInlineImageUploading ? "Enviando imagem 16:9..." : inlineImageMessage}
        </p>
      ) : null}
    </div>
  );
}

const COVER_CANVAS_WIDTH = 1280;
const COVER_CANVAS_HEIGHT = 720;
const COVER_MAX_FILE_SIZE = 8 * 1024 * 1024;

async function isAllowedImageFile(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return false;
  if (file.size > COVER_MAX_FILE_SIZE) return false;

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isWebp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50;

  return isJpeg || isPng || isWebp;
}

function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(url)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Imagem inválida."));
    image.src = url;
  });
}

async function makeCroppedCoverBlob(imageUrl: string, zoom: number, offsetX: number, offsetY: number) {
  const image = await loadImageFromUrl(imageUrl);
  if (image.naturalWidth < 800 || image.naturalHeight < 450) {
    throw new Error("Use uma imagem com pelo menos 800x450px.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = COVER_CANVAS_WIDTH;
  canvas.height = COVER_CANVAS_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");

  context.fillStyle = "#f5f4ef";
  context.fillRect(0, 0, COVER_CANVAS_WIDTH, COVER_CANVAS_HEIGHT);

  const baseScale = Math.max(COVER_CANVAS_WIDTH / image.naturalWidth, COVER_CANVAS_HEIGHT / image.naturalHeight);
  const scaledWidth = image.naturalWidth * baseScale * zoom;
  const scaledHeight = image.naturalHeight * baseScale * zoom;
  const maxOffsetX = Math.max(0, (scaledWidth - COVER_CANVAS_WIDTH) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - COVER_CANVAS_HEIGHT) / 2);
  const drawX = (COVER_CANVAS_WIDTH - scaledWidth) / 2 + (offsetX / 100) * maxOffsetX;
  const drawY = (COVER_CANVAS_HEIGHT - scaledHeight) / 2 + (offsetY / 100) * maxOffsetY;

  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Não foi possível gerar a capa."));
        else resolve(blob);
      },
      "image/webp",
      0.86,
    );
  });
}

function BlogCoverEditor({
  valuePath,
  valueUrl,
  valueAlt,
  onChange,
}: {
  valuePath: string | null;
  valueUrl: string | null;
  valueAlt: string | null;
  onChange: (cover: Pick<BlogFormState, "cover_image_path" | "cover_image_url" | "cover_image_alt">) => void;
}) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setMessage("");
    if (!file) return;

    if (!(await isAllowedImageFile(file))) {
      setMessage("Envie uma imagem JPG, PNG ou WEBP com até 8MB.");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageFromUrl(nextUrl);
      if (image.naturalWidth < 800 || image.naturalHeight < 450) {
        URL.revokeObjectURL(nextUrl);
        setMessage("Use uma imagem com pelo menos 800x450px.");
        return;
      }
    } catch {
      URL.revokeObjectURL(nextUrl);
      setMessage("Não foi possível ler essa imagem.");
      return;
    }

    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(nextUrl);
    setFileName(file.name.slice(0, 90));
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  async function handleUpload() {
    if (!sourceUrl || !supabase) return;
    setIsUploading(true);
    setMessage("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userError || !userId) throw new Error("Sessão inválida.");

      const blob = await makeCroppedCoverBlob(sourceUrl, zoom, offsetX, offsetY);
      if (blob.size > 3 * 1024 * 1024) throw new Error("A imagem processada ficou muito pesada.");

      const path = makeCoverImagePath(userId);
      const { error } = await supabase.storage.from(BLOG_COVER_BUCKET).upload(path, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) throw error;

      onChange({
        cover_image_path: path,
        cover_image_url: getCoverImagePublicUrl(path),
        cover_image_alt: valueAlt ?? "",
      });
      setMessage("Capa salva. Publique ou salve o blog para aplicar.");
    } catch {
      setMessage("Não foi possível salvar a imagem. Tente outra imagem.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    setSourceUrl(null);
    setFileName("");
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    onChange({
      cover_image_path: null,
      cover_image_url: null,
      cover_image_alt: null,
    });
    setMessage("Capa removida. Salve o blog para aplicar.");
  }

  async function handleEditCurrent() {
    if (!valueUrl) return;
    setMessage("");
    try {
      await loadImageFromUrl(valueUrl);
      setSourceUrl(valueUrl);
      setFileName("imagem atual");
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    } catch {
      setMessage("Não foi possível editar essa imagem. Envie a imagem novamente.");
    }
  }

  const previewUrl = sourceUrl ?? valueUrl;

  return (
    <div className="blog-cover-editor">
      <div className="blog-cover-preview">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            style={{
              transform: sourceUrl ? `scale(${zoom}) translate(${offsetX / 8}%, ${offsetY / 8}%)` : undefined,
            }}
          />
        ) : (
          <span>Imagem 16:9 do blog</span>
        )}
      </div>

      <div className="blog-cover-controls">
        <label className="blog-cover-file-button">
          {previewUrl ? "Trocar imagem" : "Adicionar imagem"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        </label>
        {valueUrl ? (
          <button type="button" className="blog-cover-secondary" onClick={handleRemove}>
            Remover capa
          </button>
        ) : null}
        {valueUrl && !sourceUrl ? (
          <button type="button" className="blog-cover-secondary" onClick={handleEditCurrent}>
            Editar corte atual
          </button>
        ) : null}
      </div>

      {sourceUrl ? (
        <div className="blog-cover-crop-controls">
          <p>{fileName ? `Editando: ${fileName}` : "Ajuste o corte 16:9"}</p>
          <label>
            Zoom
            <input type="range" min="1" max="1.8" step="0.02" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
          </label>
          <label>
            Horizontal
            <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
          </label>
          <label>
            Vertical
            <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
          </label>
          <button type="button" className="blog-cover-save" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Salvando imagem..." : "Salvar capa 16:9"}
          </button>
        </div>
      ) : null}

      <label className="blog-cover-alt">
        Texto alternativo da imagem
        <input
          value={valueAlt ?? ""}
          maxLength={BLOG_COVER_ALT_MAX}
          onChange={(event) =>
            onChange({
              cover_image_path: valuePath,
              cover_image_url: valueUrl,
              cover_image_alt: event.target.value.slice(0, BLOG_COVER_ALT_MAX),
            })
          }
          placeholder="Descreva a imagem para acessibilidade"
        />
      </label>

      {message ? <p className="blog-cover-message">{message}</p> : null}
    </div>
  );
}

function AdminShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <div className="admin-shell-container">
        <a href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-brand-petroleum">
          <img src="/brand/evoluo-icon-sem-fundo.png" alt="" className="h-9 w-9 object-contain" />
          Voltar para a LP
        </a>
        <div className="admin-shell-card">
          <h1 className="font-display text-3xl font-semibold tracking-normal text-brand-ink">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminSetupNotice() {
  return (
    <AdminShell title="Configuração necessária">
      <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-ink/65">
        Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env.local`, rode o SQL em
        `supabase/schema.sql` no projeto Supabase e reinicie o preview.
      </p>
    </AdminShell>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail || !password || password.length > 256) {
      setMessage("Credenciais inválidas.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase!.auth.signInWithPassword({
      email: safeEmail,
      password,
    });
    setIsSubmitting(false);

    if (error) setMessage("Credenciais inválidas.");
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-logo-wrap">
          <img src="/brand/evoluo-icon-sem-fundo.png" alt="Evoluo" className="admin-login-logo" />
        </div>

        <div className="admin-login-heading">
          <h1 id="admin-login-title">Login do Blog</h1>
          <p>Acesso restrito para publicação de conteúdos da Evoluo.</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <label>
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value.slice(0, 254))}
              placeholder="email@exemplo.com"
              required
            />
          </label>
          <label>
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </label>
          {message ? <p className="admin-login-message">{message}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="admin-login-button">
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="admin-login-footer">
          <a href="/">Voltar para a LP</a>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const [activeView, setActiveView] = useState<"create" | "published">("create");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogFormState>(emptyBlogForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingPublish, setPendingPublish] = useState<BlogFormState | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const titleCount = form.title.trim().length;
  const contentCount = stripBlogMarkup(form.content).length;
  const coverAltCount = (form.cover_image_alt ?? "").trim().length;
  const currentEditingPost = useMemo(() => posts.find((post) => post.id === editingId) ?? null, [editingId, posts]);

  async function loadPosts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,title,slug,content,cover_image_path,cover_image_url,cover_image_alt,status,published_at,updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    if (!error && data) setPosts(data as BlogPost[]);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function resetForm() {
    setForm(emptyBlogForm);
    setEditingId(null);
    setMessage("");
  }

  function validateForm(): BlogFormState | null {
    const normalized = {
      title: normalizeBlogInput(form.title),
      content: sanitizeBlogHtml(form.content),
      cover_image_path: form.cover_image_path,
      cover_image_url: form.cover_image_url,
      cover_image_alt: normalizeBlogInput(form.cover_image_alt ?? "") || null,
    };
    const result = blogPostSchema.safeParse({
      title: normalized.title,
      content: normalizeBlogInput(stripBlogMarkup(normalized.content)),
      cover_image_path: normalized.cover_image_path,
      cover_image_url: normalized.cover_image_url,
      cover_image_alt: normalized.cover_image_alt,
    });
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? "Revise os campos antes de publicar.");
      return null;
    }
    return normalized;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const validData = validateForm();
    if (!validData) return;
    setPendingPublish(validData);
  }

  async function publishConfirmed() {
    if (!pendingPublish || !supabase) return;
    setIsSaving(true);
    setMessage("");

    const response = editingId
      ? await supabase
          .from("blog_posts")
          .update({
            title: pendingPublish.title,
            content: pendingPublish.content,
            cover_image_path: pendingPublish.cover_image_path,
            cover_image_url: pendingPublish.cover_image_url,
            cover_image_alt: pendingPublish.cover_image_alt,
          })
          .eq("id", editingId)
          .select("id")
          .single()
      : await supabase
          .from("blog_posts")
          .insert({
            title: pendingPublish.title,
            content: pendingPublish.content,
            cover_image_path: pendingPublish.cover_image_path,
            cover_image_url: pendingPublish.cover_image_url,
            cover_image_alt: pendingPublish.cover_image_alt,
            status: "published",
            slug: currentEditingPost?.slug ?? makeSlug(pendingPublish.title),
          })
          .select("id")
          .single();

    setIsSaving(false);
    setPendingPublish(null);

    if (response.error) {
      const errorMessage = response.error.message?.toLowerCase() ?? "";
      const isContentLengthError = errorMessage.includes("blog_posts_content_length");
      setMessage(
        isContentLengthError
          ? "O texto formatado ficou grande demais. Reduza um pouco o conteúdo ou limpe a formatação colada."
          : "Não foi possível salvar. Verifique se este usuário tem permissão de administrador.",
      );
      return;
    }

    setMessage(editingId ? "Blog atualizado com sucesso." : "Blog publicado com sucesso.");
    resetForm();
    await loadPosts();
    setActiveView("published");
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      cover_image_path: post.cover_image_path,
      cover_image_url: post.cover_image_url,
      cover_image_alt: post.cover_image_alt,
    });
    setMessage("");
    setActiveView("create");
  }

  async function handleLogout() {
    await supabase!.auth.signOut();
  }

  return (
    <AdminShell title="Publicação de Blogs">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-brand-petroleum/15 bg-brand-creme/70 p-1">
          <button
            type="button"
            onClick={() => setActiveView("create")}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", activeView === "create" ? "bg-brand-petroleum text-brand-creme" : "text-brand-ink/65")}
          >
            {editingId ? "Editar blog" : "Novo blog"}
          </button>
          <button
            type="button"
            onClick={() => setActiveView("published")}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", activeView === "published" ? "bg-brand-petroleum text-brand-creme" : "text-brand-ink/65")}
          >
            Publicados
          </button>
        </div>
        <button type="button" onClick={handleLogout} className="rounded-full border border-brand-petroleum/20 px-4 py-2 text-sm font-semibold text-brand-petroleum">
          Sair
        </button>
      </div>

      {activeView === "create" ? (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Título do blog
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value.slice(0, BLOG_TITLE_MAX) }))}
              maxLength={BLOG_TITLE_MAX}
              className="h-12 rounded-md border border-brand-petroleum/20 bg-white px-4 outline-none focus:border-brand-petroleum"
              required
            />
            <span className="text-xs text-brand-ink/50">
              {titleCount}/{BLOG_TITLE_MAX} caracteres
            </span>
          </label>

          <div className="grid gap-2 text-sm font-medium">
            <span>Texto do blog</span>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm((current) => ({ ...current, content }))}
            />
            <span className="text-xs text-brand-ink/50">
              {contentCount}/{BLOG_CONTENT_MAX} caracteres
            </span>
          </div>

          <div className="grid gap-2 text-sm font-medium">
            Imagem de capa 16:9
            <BlogCoverEditor
              valuePath={form.cover_image_path}
              valueUrl={form.cover_image_url}
              valueAlt={form.cover_image_alt}
              onChange={(cover) => setForm((current) => ({ ...current, ...cover }))}
            />
            <span className="text-xs text-brand-ink/50">
              {coverAltCount}/{BLOG_COVER_ALT_MAX} caracteres no texto alternativo
            </span>
          </div>

          {message ? <p className="text-sm font-medium text-brand-petroleum">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              {editingId ? "Salvar alterações" : "Publicar blog"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar edição
              </Button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-4">
          {posts.length === 0 ? (
            <p className="rounded-md border border-brand-petroleum/15 bg-brand-creme/70 p-4 text-sm text-brand-ink/65">
              Nenhum blog publicado ainda.
            </p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="blog-published-row">
                <div className="blog-published-item">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt="" className="blog-admin-thumb" />
                  ) : (
                    <div className="blog-admin-thumb blog-admin-thumb-empty">Sem capa</div>
                  )}
                  <div className="blog-published-copy">
                    <h2 className="font-display text-xl font-semibold text-brand-ink">{post.title}</h2>
                    <p className="blog-excerpt mt-3 text-sm leading-6 text-brand-ink/60">{toExcerpt(post.content, 260)}</p>
                    <button type="button" onClick={() => startEdit(post)} className="mt-5 text-sm font-semibold text-brand-petroleum">
                      Editar conteúdo
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {pendingPublish ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            <button type="button" className="absolute inset-0 bg-brand-petroleum/45 backdrop-blur-sm" onClick={() => setPendingPublish(null)} aria-label="Cancelar publicação" />
            <div className="relative z-10 w-full max-w-lg rounded-lg bg-brand-creme p-6 shadow-2xl">
              <h2 className="font-display text-2xl font-semibold text-brand-ink">Confirmar publicação</h2>
              <p className="mt-4 text-sm leading-7 text-brand-ink/65">
                Eu confirmo a publicação do blog “{pendingPublish.title}”. O conteúdo ficará visível na LP após salvar.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={publishConfirmed} disabled={isSaving}>
                  Confirmo a publicação
                </Button>
                <Button type="button" variant="outline" onClick={() => setPendingPublish(null)}>
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </AdminShell>
  );
}

function AdminApp() {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSessionUserId(data.session?.user.id ?? null);
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user.id ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured || !supabase) return <AdminSetupNotice />;
  if (!authReady) return <AdminShell title="Carregando..." />;
  if (!sessionUserId) return <AdminLogin />;
  return <AdminDashboard />;
}

function BlogPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!supabase || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,content,cover_image_path,cover_image_url,cover_image_alt,status,published_at,updated_at")
        .eq("status", "published")
        .eq("slug", slug)
        .limit(1)
        .single();

      if (isMounted) {
        setPost(error ? null : (data as BlogPost));
        setIsLoading(false);
      }
    }

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-brand-ink">
      <Navbar1 />
      <main className="section-padding pt-32">
        <article className="container max-w-3xl">
          <a href="/#blog" className="text-sm font-semibold text-brand-petroleum">
            Voltar para o Blog
          </a>
          {isLoading ? (
            <p className="mt-10 text-brand-ink/60">Carregando artigo...</p>
          ) : post ? (
            <>
              <h1 className="mt-8 font-display text-4xl font-semibold leading-tight tracking-normal text-brand-ink sm:text-5xl">
                {post.title}
              </h1>
              {post.cover_image_url ? (
                <img src={post.cover_image_url} alt={post.cover_image_alt ?? ""} className="blog-post-cover" />
              ) : (
                <BlogPostCoverPlaceholder />
              )}
              <div className="blog-content mt-8 space-y-5 text-lg leading-9 text-brand-ink/72">
                <BlogContent content={post.content} />
              </div>
            </>
          ) : (
            <div className="mt-10 rounded-lg border border-brand-petroleum/15 bg-white/55 p-6">
              <h1 className="font-display text-3xl font-semibold text-brand-ink">Artigo não encontrado</h1>
              <p className="mt-4 text-brand-ink/65">O conteúdo pode ter sido removido ou ainda não foi publicado.</p>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

function LandingPage() {
  const [selectedSpecialtyIndex, setSelectedSpecialtyIndex] = useState<number | null>(null);
  const [activeProductPanel, setActiveProductPanel] = useState<"rental" | "sale" | null>(null);
  const [targetProductTitle, setTargetProductTitle] = useState<string | null>(null);
  const [isProductPanelClosing, setIsProductPanelClosing] = useState(false);
  const overlayHistoryPushedRef = useRef(false);
  const ignoreNextPopRef = useRef(false);
  const selectedSpecialty = selectedSpecialtyIndex === null ? null : specialtyGroups[selectedSpecialtyIndex];
  const activeProductPanelData =
    activeProductPanel === "rental"
      ? {
          title: "Equipamentos para locação",
          description: "Equipamentos disponibilizados para apoiar o cuidado domiciliar conforme orientação profissional.",
          products: rentalProducts,
          icon: Package,
        }
      : activeProductPanel === "sale"
        ? {
            title: "Produtos para venda",
            description: "Acessórios e recursos respiratórios para dar suporte às diferentes etapas do tratamento.",
            products: saleProducts,
            icon: Wind,
        }
        : null;

  function scrollToSection(targetId: string) {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pushOverlayHistory() {
    if (overlayHistoryPushedRef.current) return;

    window.history.pushState({ evoluoOverlay: true }, "", window.location.href);
    overlayHistoryPushedRef.current = true;
  }

  function clearOverlayHistoryEntry() {
    if (!overlayHistoryPushedRef.current) return;

    ignoreNextPopRef.current = true;
    overlayHistoryPushedRef.current = false;
    window.history.back();
  }

  function openSpecialtyModal(index: number) {
    pushOverlayHistory();
    setActiveProductPanel(null);
    setTargetProductTitle(null);
    setIsProductPanelClosing(false);
    setSelectedSpecialtyIndex(index);
  }

  function closeSpecialtyModal(syncHistory = true) {
    setSelectedSpecialtyIndex(null);
    if (syncHistory) clearOverlayHistoryEntry();
  }

  function openProductPanel(panel: "rental" | "sale", productTitle: string | null = null) {
    pushOverlayHistory();
    setSelectedSpecialtyIndex(null);
    setIsProductPanelClosing(false);
    setTargetProductTitle(productTitle);
    setActiveProductPanel(panel);
  }

  function closeProductPanel(syncHistory = true) {
    if (!activeProductPanel || isProductPanelClosing) return;

    setIsProductPanelClosing(true);
    window.setTimeout(() => {
      setActiveProductPanel(null);
      setTargetProductTitle(null);
      setIsProductPanelClosing(false);
    }, 320);

    if (syncHistory) clearOverlayHistoryEntry();
  }

  function requestProductQuote() {
    if (!activeProductPanel || isProductPanelClosing) return;

    setIsProductPanelClosing(true);
    window.setTimeout(() => {
      setActiveProductPanel(null);
      setTargetProductTitle(null);
      setIsProductPanelClosing(false);
      overlayHistoryPushedRef.current = false;
      window.history.replaceState(null, "", "#contato");
      window.requestAnimationFrame(() => scrollToSection("contato"));
    }, 320);
  }

  useEffect(() => {
    const handleNavigationAction = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { type: "scroll"; targetId: string }
        | { type: "specialty"; index: number }
        | { type: "product"; panel: "rental" | "sale"; productTitle?: string };

      if (!detail) return;

      if (detail.type === "scroll") {
        closeSpecialtyModal();
        closeProductPanel();
        scrollToSection(detail.targetId);
        return;
      }

      if (detail.type === "specialty") {
        openSpecialtyModal(detail.index);
        scrollToSection("especialidades");
        return;
      }

      if (detail.type === "product") {
        scrollToSection("produtos");
        openProductPanel(detail.panel, detail.productTitle ?? null);
      }
    };

    window.addEventListener("evoluo:navigation-action", handleNavigationAction);
    return () => window.removeEventListener("evoluo:navigation-action", handleNavigationAction);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }

      if (selectedSpecialtyIndex === null && activeProductPanel === null) return;

      overlayHistoryPushedRef.current = false;
      closeSpecialtyModal(false);
      closeProductPanel(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedSpecialtyIndex, activeProductPanel, isProductPanelClosing]);

  useEffect(() => {
    if (selectedSpecialtyIndex === null && activeProductPanel === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSpecialtyModal();
        closeProductPanel();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSpecialtyIndex, activeProductPanel, isProductPanelClosing]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar1 />

      <main>
        <section id="home" className="relative min-h-screen overflow-hidden border-b border-brand-petroleum/15 pt-28">
          <div className="noise absolute inset-0 opacity-35" />
          <div className="container hero-layout relative min-h-[calc(100vh-7rem)] py-12 lg:py-16">
            <div className="hero-copy order-1 max-w-4xl text-center lg:text-left">
	              <motion.div
	                className="mb-7 inline-flex items-center gap-2 rounded-full border bg-white/65 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur-md"
	                style={{ borderColor: "#8B93CF", color: "#7A83C5" }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <Sparkles className="h-4 w-4" />
                Fisioterapia domiciliar com direção clínica
              </motion.div>
              <motion.h1
                className="max-w-5xl font-display text-balance text-5xl font-semibold leading-tight tracking-normal text-brand-petroleum sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Evolução que se vive.
              </motion.h1>
              <div className="hero-desktop-word mt-4">
                <MorphingText
                  className="max-w-4xl text-center text-brand-lime lg:text-left"
                  texts={["recuperação", "continuidade", "segurança", "autonomia"]}
                />
              </div>
              <div className="hero-mobile-word relative mt-4 text-center font-display text-4xl font-semibold leading-none tracking-normal text-brand-lime">
                <AnimatedTextCycle
                  words={["recuperação", "continuidade", "segurança", "autonomia"]}
                  interval={2800}
                />
              </div>
              <motion.p
                className="mt-4 max-w-3xl text-center font-display text-2xl font-medium leading-9 tracking-normal text-brand-ink sm:text-3xl sm:leading-10 lg:text-left"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.22 }}
              >
                Fisioterapia domiciliar com direção clínica, acompanhamento contínuo e cuidado individualizado.
              </motion.p>
              <motion.p
                className="mt-5 max-w-2xl text-center text-lg leading-8 text-brand-ink/65 lg:text-left"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.3 }}
              >
                Atendimento especializado para pacientes que buscam qualidade técnica, continuidade no cuidado e mais
                segurança e funcionalidade para o dia a dia.
              </motion.p>
              <motion.div
                className="hero-actions mt-9 flex flex-col justify-start gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42 }}
              >
                <Button asChild size="lg" className="hero-action-button">
                  <a href="#contato">
                    Agendar Avaliação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="hero-action-button">
                  <a href="#especialidades">Conhecer especialidades</a>
                </Button>
              </motion.div>
            </div>
            <HeroImageCollage />
          </div>
        </section>

        <section id="evoluo" className="evoluo-center-section lavender-grid-section section-padding border-b border-brand-petroleum/10">
          <div className="container">
            <Reveal className="evoluo-center-copy">
              <span className="section-accent-line" aria-hidden="true" />
              <h2 className="font-display text-balance text-4xl font-semibold tracking-normal text-brand-ink sm:text-5xl">
                Evolução não acontece de forma imediata. Ela é construída todos os dias.
              </h2>
              <p className="mt-6 text-lg leading-8 text-brand-ink/65">
                A Evoluo nasceu da compreensão de que cada paciente possui uma trajetória única de reabilitação.
                Por isso, desenvolvemos uma estrutura de atendimento domiciliar que combina conhecimento técnico,
                acompanhamento contínuo e direção clínica para promover mudanças reais e sustentáveis.
              </p>
            </Reveal>
          </div>
        </section>

        <section id="equipe" className="section-padding border-b border-brand-petroleum/10 bg-brand-creme">
          <div className="container">
            <TeamShowcase />
          </div>
        </section>

        <section
          id="metodo"
          className="method-section section-padding border-y border-brand-petroleum/10 text-brand-ink"
          style={{
            "--method-bg-image": "url('/sections/jornada-paciente-bg.png')",
            "--method-bg-image-mobile": "url('/sections/jornada-paciente-bg-mobile.png')",
          } as CSSProperties}
        >
          <div className="container">
            <SectionHeading
              eyebrow="Método"
              title="Jornada do Paciente"
              text="Uma jornada clara, da avaliação ao acompanhamento."
            />
            <JourneyTimeline />
            <Reveal className="method-support-heading mt-14">
              <span className="section-accent-line" aria-hidden="true" />
              <h3 className="font-display text-3xl font-semibold tracking-normal text-brand-ink">O que sustenta a nossa forma de cuidar.</h3>
            </Reveal>
            <Reveal className="method-differentials-grid mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {differentials.map((item) => (
                <div key={item.title} className="method-differential-card flex gap-3 text-sm leading-6 text-brand-ink/65">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-brand-petroleum" />
                  <span>
                    <span className="block font-semibold text-brand-ink">{item.title}</span>
                    <span className="mt-2 block">{item.text}</span>
                  </span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="especialidades" className="section-padding border-b border-brand-petroleum/10 bg-background">
          <div className="container">
            <SectionHeading
              eyebrow="Especialidades"
              title="Especialidades que acompanham diferentes jornadas de fisioterapia"
              text="Cada paciente possui necessidades, objetivos e desafios diferentes ao longo da sua jornada de saúde. Por isso, a Evoluo oferece atendimento fisioterapêutico especializado em diferentes áreas da fisioterapia sempre com acompanhamento individualizado, direção clínica e foco na evolução funcional de cada pessoa."
            />
            <div className="specialty-grid mt-16">
              {specialtyGroups.map((item, index) => (
                <Reveal key={item.group} delay={index * 0.04} className="h-full">
                  <SpecialtyCard
                    item={item}
                    index={index}
                    onClick={() => openSpecialtyModal(index)}
                  />
                </Reveal>
              ))}
            </div>
            <AnimatePresence>
              {selectedSpecialty && selectedSpecialtyIndex !== null ? (
                <SpecialtyModal
                  item={selectedSpecialty}
                  index={selectedSpecialtyIndex}
                  onClose={() => closeSpecialtyModal()}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        <section id="produtos" className="lavender-grid-section section-padding">
          <div className="container">
            <div className="product-section-grid">
              <SectionHeading
                eyebrow="Produtos"
                title="Equipamentos e recursos que apoiam a reabilitação e o cuidado domiciliar."
                text="Além do atendimento fisioterapêutico, a Evoluo disponibiliza equipamentos e acessórios que auxiliam diferentes etapas do tratamento, oferecendo suporte respiratório, recuperação funcional e mais conforto durante o processo de reabilitação."
              />
              <Reveal className="product-action-panel">
                <button type="button" className="product-action-button" onClick={() => openProductPanel("rental")}>
                  <span className="product-action-icon">
                    <Package className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-semibold tracking-normal">Equipamentos para locação</span>
                    <span className="mt-2 block text-sm leading-6 text-brand-ink/60">Ver equipamentos disponíveis</span>
                  </span>
                  <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
                </button>
                <button type="button" className="product-action-button" onClick={() => openProductPanel("sale")}>
                  <span className="product-action-icon">
                    <Wind className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-semibold tracking-normal">Produtos para venda</span>
                    <span className="mt-2 block text-sm leading-6 text-brand-ink/60">Ver acessórios e recursos</span>
                  </span>
                  <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
                </button>
              </Reveal>
            </div>
            <AnimatePresence>
              {activeProductPanelData ? (
                <ProductDrawer
                  title={activeProductPanelData.title}
                  description={activeProductPanelData.description}
                  products={activeProductPanelData.products}
                  icon={activeProductPanelData.icon}
                  targetProductTitle={targetProductTitle}
                  isClosing={isProductPanelClosing}
                  onClose={closeProductPanel}
                  onRequestQuote={requestProductQuote}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {SHOW_CLIENT_STORIES ? (
          <section id="clientes" className="section-padding border-y border-brand-petroleum/10 bg-white/45">
            <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <SectionHeading
                eyebrow="Clientes"
                title="Histórias que fazem parte da nossa trajetória."
                text="Cada paciente possui uma jornada única e nós tivemos o privilégio de acompanhar histórias de superação, recuperação funcional e qualidade de vida."
              />
              <Reveal className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="client-story-card rounded-lg border border-dashed bg-brand-creme/50 p-6">
                    <ClipboardCheck className="h-7 w-7 text-brand-lime" />
                    <p className="mt-8 font-display text-lg font-medium text-brand-ink">Depoimento em validação</p>
                    <p className="mt-3 text-sm leading-6 text-brand-ink/60">
                      Área reservada para inserção dos depoimentos a serem enviados pela Evoluo.
                    </p>
                  </div>
                ))}
              </Reveal>
            </div>
          </section>
        ) : null}

        <BlogSection />

        <section id="contato" data-navbar-tone="dark" className="section-padding bg-brand-petroleum text-brand-creme">
          <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionHeading
              eyebrow="Contato"
              title="Sua evolução começa com um plano claro."
              text="Fale com nossa equipe e descubra como podemos construir uma jornada de reabilitação mais estruturada, segura e focada em resultados."
              light
            />
            <Reveal className="contact-card rounded-lg border bg-brand-creme text-brand-ink p-6 shadow-[0_18px_60px_rgba(213,227,112,0.18)]">
              <div className="grid gap-3">
                <a
                  href="https://wa.me/5511926913003"
                  className="contact-action flex items-center justify-between rounded-md bg-brand-petroleum p-4 text-brand-creme transition hover:bg-brand-blue"
                >
                  <span className="contact-action-copy flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 shrink-0 text-brand-lime" />
                    <span>WhatsApp: (11) 92691-3003</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
                <a
                  href="mailto:contato@evoluofisioterapia.com.br"
                  className="contact-action flex items-center justify-between rounded-md border border-brand-lime/55 p-4 transition hover:border-brand-lime"
                >
                  <span className="contact-action-copy flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-brand-lime" />
                    <span>contato@evoluofisioterapia.com.br</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer4Col />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp-button"
        aria-label="Chamar a Evoluo no WhatsApp"
      >
        <img src={WHATSAPP_LOGO_SRC} alt="" className="floating-whatsapp-logo" />
      </a>
    </div>
  );
}

function App() {
  if (window.location.pathname.startsWith("/admin")) return <AdminApp />;
  if (window.location.pathname.startsWith("/blog/")) {
    const slug = window.location.pathname.replace(/^\/blog\//, "").split("/")[0] ?? "";
    return <BlogPostPage slug={slug} />;
  }
  return <LandingPage />;
}

export default App;
