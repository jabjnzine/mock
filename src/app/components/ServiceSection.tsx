"use client";

const SERVICES = [
  {
    icon: "💻",
    badge: "Dev",
    title: "Website Design & Development",
    desc: "End-to-end web solutions built for performance & scale.",
    items: [
      "Inventory Management Systems",
      "Point of Sale Systems (POS)",
      "E-commerce Platforms",
      "Custom Business Software",
    ],
  },
  {
    icon: "🎨",
    badge: "Design",
    title: "Graphic Design & Artwork",
    desc: "Visual identities that leave a lasting impression.",
    items: [
      "Logo & Brand Identity",
      "Marketing Materials",
      "Designed to Make an Impact",
    ],
  },
  {
    icon: "📱",
    badge: "Mobile",
    title: "Mobile App Development",
    desc: "Cross-platform apps that feel native everywhere.",
    items: [
      "React Native & Flutter",
      "PWA & Cross-platform",
      "LINE Platform Integration",
    ],
  },
  {
    icon: "☁️",
    badge: "Cloud",
    title: "Cloud & DevOps Solutions",
    desc: "Reliable infrastructure that grows with your product.",
    items: [
      "AWS & Vercel Deployment",
      "Docker & CI/CD Pipelines",
      "Server Management & Nginx",
    ],
  },
];

export default function ServiceSection() {
  return (
    <section id="service" className="pf-section">
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="pf-hero-pill">
          <span className="pf-live-dot" /> What I Offer
        </div>
        <h1 className="pf-hero-title">
          Digital <span className="pf-grad-text">Services</span>
        </h1>
        <p className="pf-hero-sub">
          Optimize your business with user-friendly, scalable, and efficient digital solutions.
        </p>
      </div>

      <div className="pf-section-divider">
        <span className="pf-section-divider-label">Services</span>
        <span className="pf-section-divider-line" />
        <span className="pf-section-divider-label">04</span>
      </div>
      <div className="pf-service-grid">
        {SERVICES.map((s) => (
          <div key={s.badge} className="pf-service-card pf-glass">
            <div className="pf-card-banner" />
            <div className="pf-card-body">
              <div className="pf-card-icon">{s.icon}</div>
              <span className="pf-card-badge">{s.badge}</span>
              <h2 className="pf-card-title">{s.title}</h2>
              <p className="pf-card-desc">{s.desc}</p>
              <ul className="pf-card-list">
                {s.items.map((item) => (
                  <li key={item}>
                    <span className="pf-li-dot">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#project" className="pf-btn">
                <span className="pf-btn-text">View Details</span>
                <div className="pf-btn-arrow">→</div>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
