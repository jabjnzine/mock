"use client";

import React, { useState, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Trip {
  id: number;
  code: string;
  date: string;
  type: string;
  round: string;
  program: string;
  registration: string;
  personnel: string;
  guide: string;
  pax: number;
  waiting: number;
  checkedIn: number;
  noShow: number;
  hasAlert: boolean;
}

export interface TripTableTotals {
  pax: number;
  waiting: number;
  checkedIn: number;
  noShow: number;
}

export interface TripTableProps {
  trips: Trip[];
  totals: TripTableTotals;
  onTripClick?: (code: string) => void;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const FONT = "'IBM Plex Sans Thai', sans-serif";

const bodyText = (color = "#2A2A2A", bold = false): React.CSSProperties => ({
  color,
  fontSize: 16,
  fontFamily: FONT,
  fontWeight: bold ? 500 : 400,
  lineHeight: "24px",
  letterSpacing: "0.02px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const linkStyle: React.CSSProperties = {
  color: "#265ED6",
  fontSize: 16,
  fontFamily: FONT,
  fontWeight: 400,
  lineHeight: "24px",
  textDecoration: "underline",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

// ─── Sub-components (SVG เพื่อไม่ให้ไอคอนเพี้ยน) ─────────────────────────────

const JOIN_IN_BLUE = "#265ED6";
const ALERT_ORANGE = "#FD5C04";

/** ไอคอน Join In: คนสองคน (SVG จาก Figma) */
const JoinInIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <path d="M7.63411 9.05866C7.55078 9.05033 7.45078 9.05033 7.35911 9.05866C5.37578 8.99199 3.80078 7.36699 3.80078 5.36699C3.80078 3.32533 5.45078 1.66699 7.50078 1.66699C9.54245 1.66699 11.2008 3.32533 11.2008 5.36699C11.1924 7.36699 9.61745 8.99199 7.63411 9.05866Z" stroke={JOIN_IN_BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.6747 3.33301C15.2914 3.33301 16.5914 4.64134 16.5914 6.24967C16.5914 7.82467 15.3414 9.10801 13.7831 9.16634C13.7164 9.15801 13.6414 9.15801 13.5664 9.16634" stroke={JOIN_IN_BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.46563 12.133C1.44896 13.483 1.44896 15.683 3.46563 17.0247C5.75729 18.558 9.51563 18.558 11.8073 17.0247C13.824 15.6747 13.824 13.4747 11.8073 12.133C9.52396 10.608 5.76562 10.608 3.46563 12.133Z" stroke={JOIN_IN_BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.2852 16.667C15.8852 16.542 16.4518 16.3003 16.9185 15.942C18.2185 14.967 18.2185 13.3587 16.9185 12.3837C16.4602 12.0337 15.9018 11.8003 15.3102 11.667" stroke={JOIN_IN_BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const JoinInBadge: React.FC = () => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 8px",
    background: "#F8FCFF",
    borderRadius: 30,
    border: "0.8px solid #265ED6",
    flexShrink: 0,
  }}>
    <JoinInIcon />
    <span style={{
      width: 48, textAlign: "center",
      color: "#265ED6", fontSize: 14, fontFamily: FONT,
      fontWeight: 400, lineHeight: "18px", letterSpacing: "0.01px",
    }}>
      Join In
    </span>
  </div>
);

/** ไอคอน Alert: วงกลมส้ม + เส้นตั้ง + จุด ตาม SVG จาก Figma */
const AlertIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
      stroke={ALERT_ORANGE}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V13"
      stroke={ALERT_ORANGE}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.9961 16H12.0051"
      stroke={ALERT_ORANGE}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Generic header cell
interface HeaderCellProps {
  width: number;
  children: React.ReactNode;
  bg?: string;
  align?: "left" | "center" | "right";
  borderLeft?: boolean;
}
const HeaderCell: React.FC<HeaderCellProps> = ({
  width, children, bg = "#142B41", align = "left", borderLeft = true,
}) => (
  <div style={{
    width, minWidth: width, height: 44, padding: 8,
    background: bg,
    borderLeft: borderLeft ? "1px solid white" : "none",
    display: "flex", alignItems: "center",
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    flexShrink: 0,
  }}>
    <span style={{ color: "white", fontSize: 16, fontFamily: FONT, fontWeight: 500, lineHeight: "24px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  </div>
);

// Generic data cell
interface CellProps {
  width: number;
  children: React.ReactNode;
  bg?: string;
  align?: "left" | "center" | "right";
  borderLeft?: boolean;
  height?: number;
}
const Cell: React.FC<CellProps> = ({
  width, children, bg = "white", align = "left", borderLeft = true, height = 64,
}) => (
  <div style={{
    width, minWidth: width, height, padding: 8,
    background: bg,
    borderLeft: borderLeft ? "1px solid #D9D9D9" : "none",
    display: "flex", alignItems: "center",
    justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
    overflow: "visible", flexShrink: 0,
  }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TripTable: React.FC<TripTableProps> = ({ trips, totals, onTripClick }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [hoveredAlertId, setHoveredAlertId] = useState<number | null>(null);
  const dropdownRefsMap = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideAny = Object.values(dropdownRefsMap.current).some(
        (el) => el && el.contains(target)
      );
      if (!isInsideAny) setOpenDropdownId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div style={{
      display: "flex",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      width: "fit-content",
      maxWidth: "100%",
      overflowX: "auto",
    }}>
      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div style={{
        background: "white",
        borderTopLeftRadius: 8, borderBottomLeftRadius: 8,
        border: "1px solid #D9D9D9", borderRight: "none",
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ display: "flex" }}>
          <HeaderCell width={64} borderLeft={false}>#</HeaderCell>
          <HeaderCell width={158}>Trip Code</HeaderCell>
          <HeaderCell width={108}>Travel Date</HeaderCell>
          <HeaderCell width={104} align="center">Trip Type</HeaderCell>
          <HeaderCell width={108}>Trip Round</HeaderCell>
          <HeaderCell width={266}>Program</HeaderCell>
          <HeaderCell width={206}>Registration</HeaderCell>
          <HeaderCell width={206}>Personnel</HeaderCell>
          <HeaderCell width={206}>Guide</HeaderCell>
        </div>

        {/* Rows */}
        {trips.map((trip, idx) => {
          const bg = idx % 2 !== 0 ? "#F8F8F8" : "white";
          return (
            <div
              key={trip.id}
              style={{ display: "flex", borderTop: "1px solid #D9D9D9" }}
              onMouseEnter={() => setHoveredRow(trip.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div style={{ width: 64, minWidth: 64, height: 64, padding: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={bodyText()}>{idx + 1}</span>
              </div>

              <Cell width={158} bg={bg}>
                <span
                  style={linkStyle}
                  onClick={() => onTripClick?.(trip.code)}
                  onKeyDown={(e) => e.key === "Enter" && onTripClick?.(trip.code)}
                  role="button"
                  tabIndex={0}
                >
                  {trip.code}
                </span>
                {trip.hasAlert && (
                  <div
                    style={{ marginLeft: 8, position: "relative", display: "flex", alignItems: "center" }}
                    onMouseEnter={() => setHoveredAlertId(trip.id)}
                    onMouseLeave={() => setHoveredAlertId((current) => (current === trip.id ? null : current))}
                  >
                    <AlertIcon />
                    {hoveredAlertId === trip.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-48px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "#FFFFFF",
                          borderRadius: 8,
                          boxShadow: "0 0 4px rgba(0,0,0,0.16)",
                          pointerEvents: "none",
                          whiteSpace: "nowrap",
                          zIndex: 100,
                        }}
                      >
                        <div
                          style={{
                            padding: "8px 16px",
                            background: "#DBEAFE", // blue-100
                            borderRadius: 8,
                          }}
                        >
                          <span
                            style={{
                              color: "#78716C",
                              fontSize: 12,
                              fontFamily: FONT,
                              fontWeight: 400,
                              lineHeight: "16px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            Waiting Reason
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Cell>

              <Cell width={108} bg={bg}>
                <span style={bodyText()}>{trip.date}</span>
              </Cell>

              <Cell width={104} bg={bg} align="center">
                <JoinInBadge />
              </Cell>

              <Cell width={108} bg={bg}>
                <span style={bodyText()}>{trip.round}</span>
              </Cell>

              <Cell width={266} bg={bg}>
                <span style={{ ...bodyText(idx === 1 ? "#142B41" : "#2A2A2A"), width: "100%" }}>
                  {trip.program}
                </span>
              </Cell>

              <Cell width={206} bg={bg}>
                <span style={{ ...bodyText(), width: "100%" }}>{trip.registration}</span>
              </Cell>

              <Cell width={206} bg={bg}>
                <span style={{ ...bodyText(), width: "100%" }}>{trip.personnel}</span>
              </Cell>

              <Cell width={206} bg={bg}>
                <span style={{ ...bodyText(), width: "100%" }}>{trip.guide}</span>
              </Cell>
            </div>
          );
        })}

        {/* Total label */}
        <div style={{ height: 48, borderTop: "1px solid #D9D9D9", display: "flex", alignItems: "center", paddingLeft: 15 }}>
          <span style={{ color: "#265ED6", fontSize: 16, fontFamily: FONT, fontWeight: 500, lineHeight: "24px" }}>Total</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
      <div style={{
        background: "white",
        borderTopRightRadius: 8, borderBottomRightRadius: 8,
        border: "1px solid #D9D9D9",
        boxShadow: "-2px 0 4px rgba(0,0,0,0.25)",
        flexShrink: 0,
        position: "sticky",
        right: 0,
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ display: "flex" }}>
          <HeaderCell width={80} bg="#142B41" borderLeft={false} align="right">Pax</HeaderCell>
          <HeaderCell width={80} bg="#FFC107" align="center">Waiting</HeaderCell>
          <HeaderCell width={100} bg="#1CB579" align="center">Completed</HeaderCell>
          <HeaderCell width={80} bg="#D91616" align="center">No show</HeaderCell>
          <HeaderCell width={80} bg="#142B41" align="center">Action</HeaderCell>
        </div>

        {/* Rows */}
        {trips.map((trip, idx) => {
          const bg = idx % 2 !== 0 ? "#F8F8F8" : "white";
          const isOpen = openDropdownId === trip.id;
          return (
            <div key={trip.id} style={{ display: "flex", borderTop: "1px solid #D9D9D9", position: "relative" }}>
              <Cell width={80} bg={bg} align="right" borderLeft={false}><span style={bodyText()}>{trip.pax}</span></Cell>
              <Cell width={80} bg={bg} align="right"><span style={bodyText("#BF8F00")}>{trip.waiting}</span></Cell>
              <Cell width={100} bg={bg} align="right"><span style={bodyText("#1CB579")}>{trip.checkedIn}</span></Cell>
              <Cell width={80} bg={bg} align="right"><span style={bodyText("#D91616")}>{trip.noShow}</span></Cell>
              <div ref={(el) => { dropdownRefsMap.current[trip.id] = el; }} style={{ position: "relative" }}>
                <div
                  role="button"
                  tabIndex={0}
                  style={{
                    width: 80, minWidth: 80, height: 64, background: bg,
                    borderLeft: "1px solid #D9D9D9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, cursor: "pointer",
                  }}
                  onClick={() => setOpenDropdownId(isOpen ? null : trip.id)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenDropdownId(isOpen ? null : trip.id)}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#142B41" }} />
                    ))}
                  </div>
                </div>
                {isOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "100%", marginTop: 4,
                    minWidth: 128, background: "white", border: "1px solid #D9D9D9", borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 50, overflow: "hidden",
                  }}>
                    <button
                      type="button"
                      style={{
                        width: "100%", padding: "8px 16px", textAlign: "left",
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 14, fontFamily: FONT, color: "#2A2A2A",
                      }}
                      onClick={() => { onTripClick?.(trip.code); setOpenDropdownId(null); }}
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Total values */}
        <div style={{ height: 48, borderTop: "1px solid #DCEEFF", display: "flex" }}>
          <Cell width={80} height={48} bg="white" align="right" borderLeft={false}><span style={bodyText("#2A2A2A", true)}>{totals.pax}</span></Cell>
          <Cell width={80} height={48} bg="white" align="right"><span style={bodyText("#BF8F00", true)}>{totals.waiting}</span></Cell>
          <Cell width={100} height={48} bg="white" align="right"><span style={bodyText("#1CB579", true)}>{totals.checkedIn}</span></Cell>
          <Cell width={80} height={48} bg="white" align="right"><span style={bodyText("#D91616", true)}>{totals.noShow}</span></Cell>
          <div style={{ width: 80, minWidth: 80, height: 48, borderLeft: "1px solid #D9D9D9", flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
};

export default TripTable;
