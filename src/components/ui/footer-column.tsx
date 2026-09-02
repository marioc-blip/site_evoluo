import Instagram from "lucide-react/dist/esm/icons/instagram.js";
import Mail from "lucide-react/dist/esm/icons/mail.js";
import Phone from "lucide-react/dist/esm/icons/phone.js";

const footerGroups = [
  {
    title: "Mapa",
    links: [
      { text: "A Evoluo", href: "#evoluo" },
      { text: "Especialidades", href: "#especialidades" },
      { text: "Produtos", href: "#produtos" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { text: "Clientes", href: "#clientes" },
      { text: "Blog", href: "#blog" },
      { text: "Contato", href: "#contato" },
    ],
  },
];

export default function Footer4Col() {
  return (
    <footer className="border-t border-brand-petroleum/15 bg-brand-creme">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/brand/evoluo-icon-sem-fundo.png"
                alt=""
                className="h-11 w-11 object-contain"
              />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-brand-ink/65">
              Fisioterapia domiciliar com direção clínica, acompanhamento contínuo e cuidado individualizado.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="font-display text-sm font-semibold text-brand-lime">{group.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-brand-ink/62">
                {group.links.map((link) => (
                  <li key={link.text}>
                    <a href={link.href} className="transition hover:text-brand-petroleum">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-display text-sm font-semibold text-brand-lime">Contato</p>
            <ul className="mt-5 space-y-3 text-sm text-brand-ink/62">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-lime" />
                <a href="https://wa.me/5511926913003" className="hover:text-brand-petroleum">
                  (11) 92691-3003
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-lime" />
                <a href="mailto:contato@evoluofisioterapia.com.br" className="hover:text-brand-petroleum">
                  contato@evoluofisioterapia.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-brand-lime" />
                <a
                  href="https://www.instagram.com/evoluofisioterapia/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-petroleum"
                >
                  @evoluofisioterapia
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-petroleum/10 pt-6 text-xs text-brand-ink/50">
          <p>&copy; 2026 Evoluo Fisioterapia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
