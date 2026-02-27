"use client";

const PROJECTS = [
  {
    icon: "📦",
    title: "Inventory Management Systems",
    subtitle: "ระบบจัดการสินค้าคงคลัง",
    tech: ["React", "Node.js", "MongoDB", "TypeScript"],
    features: [
      "ติดตามสินค้าคงคลังแบบ Real-time",
      "ระบบแจ้งเตือนสินค้าใกล้หมด",
      "รายงานการเคลื่อนไหวสินค้า",
      "ระบบ Barcode/QR Code",
    ],
    usecase:
      "ระบบจัดการสินค้าคงคลังสำหรับร้านค้าปลีก ร้านค้าออนไลน์ และคลังสินค้า ช่วยลดต้นทุนและเพิ่มประสิทธิภาพการจัดการ",
  },
  {
    icon: "🖥️",
    title: "Point of Sale (POS) Systems",
    subtitle: "ระบบขายหน้าร้าน",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    features: [
      "ระบบขายและรับชำระเงิน",
      "รายงานยอดขายรายวัน/เดือน",
      "ระบบสมาชิกและสะสมแต้ม",
      "รองรับการพิมพ์ใบเสร็จ",
    ],
    usecase:
      "ระบบ POS สำหรับร้านอาหาร คาเฟ่ ร้านค้าปลีก รองรับการทำงานแบบ Multi-user และเชื่อมต่อกับระบบอื่นๆ",
  },
  {
    icon: "🛒",
    title: "E-commerce Platforms",
    subtitle: "แพลตฟอร์มขายสินค้าออนไลน์",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    features: [
      "ระบบร้านค้าออนไลน์ครบวงจร",
      "ระบบชำระเงินออนไลน์",
      "ระบบจัดการคำสั่งซื้อ",
      "ระบบสมาชิกและโปรโมชั่น",
    ],
    usecase:
      "เว็บไซต์ขายสินค้าออนไลน์ที่รองรับการขายสินค้าหลายประเภท มีระบบจัดการที่ครบครันและใช้งานง่าย",
  },
  {
    icon: "⚙️",
    title: "Custom Business Software",
    subtitle: "ซอฟต์แวร์ธุรกิจเฉพาะทาง",
    tech: ["React", "Node.js", "PostgreSQL", "Docker"],
    features: [
      "ออกแบบตามความต้องการเฉพาะ",
      "ระบบจัดการข้อมูลครบวงจร",
      "รายงานและวิเคราะห์ข้อมูล",
      "รองรับการขยายระบบในอนาคต",
    ],
    usecase:
      "ซอฟต์แวร์ที่ออกแบบมาเฉพาะสำหรับธุรกิจของคุณ รองรับทั้งธุรกิจขนาดเล็กและใหญ่",
  },
];

export default function ProjectSection() {
  return (
    <section id="project" className="pf-section">
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="pf-hero-pill">
          <span className="pf-live-dot" /> Portfolio
        </div>
        <h1 className="pf-hero-title">
          Selected <span className="pf-grad-text">Projects</span>
        </h1>
        <p className="pf-hero-sub">
          ระบบซอฟต์แวร์ที่ออกแบบมาเพื่อตอบสนองความต้องการของธุรกิจทุกขนาด
        </p>
      </div>

      <div className="pf-section-divider">
        <span className="pf-section-divider-label">Projects</span>
        <span className="pf-section-divider-line" />
        <span className="pf-section-divider-label">04</span>
      </div>
      <div className="pf-project-grid">
        {PROJECTS.map((p) => (
          <div key={p.title} className="pf-proj-card">
            <div className="pf-card-banner" />
            <div className="pf-proj-body">
              <div className="pf-proj-header">
                <div className="pf-proj-icon">{p.icon}</div>
                <div className="pf-proj-header-text">
                  <div className="pf-proj-title">{p.title}</div>
                  <div className="pf-proj-subtitle">{p.subtitle}</div>
                  <span className="pf-status-badge">
                    <span className="pf-status-dot" /> LIVE
                  </span>
                </div>
              </div>
              <div className="pf-tech-tags">
                {p.tech.map((t) => (
                  <span key={t} className="pf-tech-tag">{t}</span>
                ))}
              </div>
              <div className="pf-proj-sep" />
              <div className="pf-feature-label">ฟีเจอร์หลัก</div>
              <ul className="pf-feature-list">
                {p.features.map((f) => (
                  <li key={f}>
                    <span className="pf-p-li-dot">✦</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pf-usecase-box">
                <div className="pf-usecase-label">💡 ตัวอย่างการใช้งาน</div>
                <div className="pf-usecase-text">{p.usecase}</div>
              </div>
              <a href="#contact" className="pf-btn">
                <span className="pf-btn-text">ดูตัวอย่างโปรเจค</span>
                <div className="pf-btn-arrow">→</div>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
