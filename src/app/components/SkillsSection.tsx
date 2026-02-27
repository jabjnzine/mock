"use client";

const STACK = [
  { icon: "⚡", title: "Frontend", tags: ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5", "CSS3"] },
  { icon: "🔧", title: "Backend", tags: ["Node.js", "NestJS", "Express", "Python", "REST API", "GraphQL", "JWT", "Socket.io"] },
  { icon: "🗄️", title: "Database", tags: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Prisma", "TypeORM"] },
  { icon: "☁️", title: "DevOps & Cloud", tags: ["Docker", "Git", "GitHub", "AWS", "Vercel", "CI/CD", "Linux", "Nginx"] },
  { icon: "🖌️", title: "Design Tools", tags: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "After Effects", "Sketch"] },
  { icon: "📱", title: "Mobile & Others", tags: ["React Native", "Flutter", "PWA", "WebSocket", "Microservices", "Agile"] },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="pf-section">
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="pf-hero-pill">
          <span className="pf-live-dot" /> Portfolio · Skills
        </div>
        <h1 className="pf-hero-title">
          My <span className="pf-grad-text">Skills</span>
          <br />&amp; Stack
        </h1>
        <p className="pf-hero-sub">
          Professional expertise in modern technologies and design tools
        </p>
      </div>

      <div className="pf-section-divider">
        <span className="pf-section-divider-label">Core Expertise</span>
        <span className="pf-section-divider-line" />
      </div>
      <div className="pf-expertise-grid" style={{ marginBottom: 50 }}>
        <div className="pf-exp-card pf-glass ux">
          <div className="pf-exp-icon-wrap">
            <div className="pf-exp-icon">🎨</div>
            <h3>UX / UI Design</h3>
          </div>
          <p className="pf-desc">User experience &amp; user interface design</p>
          <ul className="pf-exp-list">
            <li><span className="pf-bullet" />Design system for developers</li>
            <li><span className="pf-bullet" />Mock-ups &amp; Prototypes</li>
            <li><span className="pf-bullet" />User Flow &amp; Wireframes</li>
          </ul>
        </div>
        <div className="pf-exp-card pf-glass dev">
          <div className="pf-exp-icon-wrap">
            <div className="pf-exp-icon">💻</div>
            <h3>Development</h3>
          </div>
          <p className="pf-desc">Full-stack development expertise</p>
          <ul className="pf-exp-list">
            <li><span className="pf-bullet" />Frontend: React, Next.js, Vue.js, TypeScript</li>
            <li><span className="pf-bullet" />Backend: NestJS, REST API, PostgreSQL</li>
            <li><span className="pf-bullet" />LINE Platform Integration</li>
          </ul>
        </div>
      </div>

      <div className="pf-section-divider">
        <span className="pf-section-divider-label">Technology Stack</span>
        <span className="pf-section-divider-line" />
      </div>
      <div className="pf-stack-grid">
        {STACK.map((item) => (
          <div key={item.title} className="pf-stack-card pf-glass">
            <div className="pf-stack-header">
              <div className="pf-stack-icon">{item.icon}</div>
              <h3>{item.title}</h3>
            </div>
            <div className="pf-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="pf-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
