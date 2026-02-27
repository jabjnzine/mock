"use client";

type PortfolioNavbarProps = {
  activeSection: string;
  onNavClick?: (id: string) => void;
};

const LINKS = [
  { href: "#skills", label: "Skills" },
  { href: "#service", label: "Service" },
  { href: "#project", label: "Project" },
  { href: "#contact", label: "Contact" },
];

export default function PortfolioNavbar({ activeSection, onNavClick }: PortfolioNavbarProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    onNavClick?.(id);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="pf-navbar" id="portfolio-navbar">
      <a href="#" className="pf-nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); onNavClick?.(""); }}>
        <div className="pf-brand-mark">R</div>
        <span className="pf-brand-name">RATTANACODE888</span>
      </a>
      <ul className="pf-nav-links">
        {LINKS.map(({ href, label }) => {
          const id = href.slice(1);
          const isActive = activeSection === id;
          return (
            <li key={href}>
              <a
                href={href}
                className={isActive ? "active" : ""}
                onClick={(e) => handleClick(e, id)}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href="#contact"
        className="pf-nav-cta"
        onClick={(e) => handleClick(e, "contact")}
      >
        Get Started →
      </a>
      <button
        type="button"
        className="pf-nav-hamburger"
        id="portfolio-hamburger"
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
