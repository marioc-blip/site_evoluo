"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import X from "lucide-react/dist/esm/icons/x.js";

const NAV_ACTION_EVENT = "evoluo:navigation-action";
const WHATSAPP_URL = "https://wa.me/5511926913003";
const WHATSAPP_LOGO_SRC = "/brand/whatsapp-logo.svg";

type NavActionDetail =
  | { type: "scroll"; targetId: string }
  | { type: "specialty"; index: number }
  | { type: "product"; panel: "rental" | "sale"; productTitle?: string };

const navItems: Array<{
  label: string;
  href: string;
  dropdown?: Array<{ label: string; detail: NavActionDetail; tone?: "heading" | "item" }>;
}> = [
  {
    label: "A Evoluo",
    href: "#evoluo",
    dropdown: [
      { label: "A evolução acontece todos os dias", detail: { type: "scroll", targetId: "evoluo" } },
      { label: "Equipe clínica", detail: { type: "scroll", targetId: "equipe" } },
      { label: "Jornada do paciente", detail: { type: "scroll", targetId: "metodo" } },
    ],
  },
  {
    label: "Especialidades",
    href: "#especialidades",
    dropdown: [
      "Fisioterapia Ortopédica",
      "Fisioterapia Neurológica",
      "Reabilitação Vestibular",
      "Fisioterapia Pediátrica",
      "Fisioterapia Geriátrica",
      "Fisioterapia nos Distúrbios do Sono",
      "Fisioterapia Respiratória",
      "Fisioterapia Pós-Alta Hospitalar",
      "Fisioterapia Cardiopulmonar e Metabólica",
    ].map((label, index) => ({ label, detail: { type: "specialty", index } })),
  },
  {
    label: "Produtos",
    href: "#produtos",
    dropdown: [
      { label: "Equipamentos para locação", tone: "heading", detail: { type: "product", panel: "rental" } },
      { label: "BiPAP (AirSense 10)", tone: "item", detail: { type: "product", panel: "rental", productTitle: "BiPAP (AirSense 10)" } },
      { label: "VPAP S9", tone: "item", detail: { type: "product", panel: "rental", productTitle: "VPAP S9" } },
      { label: "Smart Cycle", tone: "item", detail: { type: "product", panel: "rental", productTitle: "Smart Cycle" } },
      { label: "Produtos para venda", tone: "heading", detail: { type: "product", panel: "sale" } },
      { label: "Circuito para CPAP e BiPAP", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Circuito para CPAP e BiPAP" } },
      { label: "Válvula Exalatória", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Válvula Exalatória" } },
      { label: "Máscara de BiPAP", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Máscara de BiPAP (Coxim Inflável)" } },
      { label: "Máscara Yuwell", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Máscara Yuwell" } },
      { label: "Máscara DreamLive Facial", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Máscara DreamLive Facial YF-03" } },
      { label: "Shaker Classic", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Shaker Classic" } },
      { label: "Respiron Classic", tone: "item", detail: { type: "product", panel: "sale", productTitle: "Respiron Classic" } },
    ],
  },
  { label: "Blog", href: "#blog" },
  { label: "Contato", href: "#contato" },
];

function dispatchNavAction(detail: NavActionDetail) {
  window.dispatchEvent(new CustomEvent<NavActionDetail>(NAV_ACTION_EVENT, { detail }));
}

const Navbar1 = () => {
  const navbarRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [openMobileGroup, setOpenMobileGroup] = React.useState<string | null>(null);
  const [isOverDarkSection, setIsOverDarkSection] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setOpenMobileGroup(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    let frameId = 0;

    const updateNavbarTone = () => {
      frameId = 0;

      if (!mediaQuery.matches) {
        setIsOverDarkSection(false);
        return;
      }

      const navbar = navbarRef.current;
      if (!navbar) return;

      const navbarRect = navbar.getBoundingClientRect();
      const sampleY = navbarRect.top + navbarRect.height / 2;
      const darkSections = document.querySelectorAll<HTMLElement>("[data-navbar-tone='dark']");

      const isOverDark = Array.from(darkSections).some((section) => {
        const sectionRect = section.getBoundingClientRect();
        return sectionRect.top <= sampleY && sectionRect.bottom >= sampleY;
      });

      setIsOverDarkSection((current) => (current === isOverDark ? current : isOverDark));
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateNavbarTone);
    };

    updateNavbarTone();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    mediaQuery.addEventListener("change", requestUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mediaQuery.removeEventListener("change", requestUpdate);
    };
  }, []);

  return (
    <div className="site-navbar-shell fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
      <div
        ref={navbarRef}
        className={`liquid-glass-navbar flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-3 md:px-6 ${
          isOverDarkSection ? "is-over-dark" : ""
        }`}
      >
        <a href="#home" className="flex items-center gap-3" aria-label="Evoluo">
          <motion.img
            src={isOverDarkSection ? "/brand/evoluo-icon-branco-sem-fundo.png" : "/brand/evoluo-icon-sem-fundo.png"}
            alt=""
            className="relative z-10 h-10 w-10 object-contain"
            initial={{ scale: 0.88 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 8 }}
            transition={{ duration: 0.3 }}
          />
        </a>

        <nav className="navbar-menu-center z-10 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <div key={item.label} className="nav-menu-item">
              <motion.a
                href={item.href}
                className="nav-menu-link rounded-full px-3 py-2 text-xs font-medium text-brand-ink/70 transition hover:bg-brand-petroleum hover:text-brand-creme"
                whileHover={{ y: -1 }}
              >
                {item.label}
                {item.dropdown ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </motion.a>
              {item.dropdown ? (
                <div className="nav-dropdown">
                  {item.dropdown.map((dropdownItem) => (
                    <button
                      key={dropdownItem.label}
                      type="button"
                      className={`nav-dropdown-link ${dropdownItem.tone === "heading" ? "is-heading" : ""}`}
                      onClick={() => dispatchNavAction(dropdownItem.detail)}
                    >
                      {dropdownItem.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="nav-actions relative z-10 ml-auto hidden items-center md:flex">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-whatsapp-button inline-flex"
            aria-label="Chamar a Evoluo no WhatsApp"
          >
            <span>Agende uma avaliação</span>
            <img src={WHATSAPP_LOGO_SRC} alt="" className="h-7 w-7 shrink-0" />
          </a>
        </div>

        <motion.button
          className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-petroleum/10 bg-brand-creme/35 text-brand-petroleum backdrop-blur-md md:hidden"
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.94 }}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-brand-creme px-6 py-6 text-brand-ink md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold tracking-[0.32em] text-brand-petroleum">EVOLUO</span>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-petroleum/15"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-14 flex flex-col gap-3 pb-10">
              {navItems.map((item, index) => (
                <div key={item.label} className="border-b border-brand-petroleum/10 pb-3">
                  {item.dropdown ? (
                    <motion.button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-2 text-left font-display text-2xl font-medium"
                      onClick={() => setOpenMobileGroup((current) => (current === item.label ? null : item.label))}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      aria-expanded={openMobileGroup === item.label}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 transition ${openMobileGroup === item.label ? "rotate-180" : ""}`}
                      />
                    </motion.button>
                  ) : (
                    <motion.a
                      href={item.href}
                      className="block py-2 font-display text-2xl font-medium"
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.label}
                    </motion.a>
                  )}
                  {item.dropdown ? (
                    openMobileGroup === item.label ? (
                      <div className="mt-2 grid gap-1 rounded-lg border border-brand-petroleum/10 bg-white/45 p-2">
                        {item.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.label}
                            type="button"
                            className={`mobile-dropdown-link ${
                              dropdownItem.tone === "heading" ? "is-heading" : ""
                            }`}
                            onClick={() => {
                              dispatchNavAction(dropdownItem.detail);
                              setIsOpen(false);
                            }}
                          >
                            {dropdownItem.label}
                          </button>
                        ))}
                      </div>
                    ) : null
                  ) : null}
                </div>
              ))}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-petroleum px-5 text-sm font-semibold text-brand-creme"
                onClick={() => setIsOpen(false)}
                aria-label="Chamar a Evoluo no WhatsApp"
              >
                Agende uma avaliação
                <img src={WHATSAPP_LOGO_SRC} alt="" className="h-8 w-8 shrink-0" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Navbar1 };
