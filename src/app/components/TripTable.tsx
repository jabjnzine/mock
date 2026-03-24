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
  waitingHoverByTripCode?: Record<string, { bookingNo: string; pax: number }[]>;
  completedModalByTripCode?: Record<string, { bookingNo: string; pax: number }[]>;
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

const PRIVATE_YELLOW = "#ffc107";

/** ไอคอน Private: คนเดียว (User icon) สีเหลือง */
const PrivateIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12.1586 10.87C12.0586 10.86 11.9386 10.86 11.8286 10.87C9.44859 10.79 7.55859 8.84 7.55859 6.44C7.55859 3.99 9.53859 2 11.9986 2C14.4486 2 16.4386 3.99 16.4386 6.44C16.4286 8.84 14.5386 10.79 12.1586 10.87Z" stroke={PRIVATE_YELLOW} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.0008 21.8097C10.1808 21.8097 8.37078 21.3497 6.99078 20.4297C4.57078 18.8097 4.57078 16.1697 6.99078 14.5597C9.74078 12.7197 14.2508 12.7197 17.0008 14.5597" stroke={PRIVATE_YELLOW} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrivateBadge: React.FC = () => (
  <div
    className="w-[88px] px-2 py-1 rounded-[30px] inline-flex flex-col justify-center items-center gap-2"
    style={{
      background: "var(--Color-Warning-50, #fffbeb)",
      outline: "0.80px solid #ffc107",
      outlineOffset: -0.8,
      flexShrink: 0,
      boxSizing: "border-box",
    }}
  >
    <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
      <PrivateIcon />
      <span
        className="text-center text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight"
        style={{ color: "#ffc107", fontFamily: FONT }}
      >
        Private
      </span>
    </div>
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

type TooltipField = "program" | "registration" | "personnel" | "guide";

const TripTable: React.FC<TripTableProps> = ({
  trips,
  totals,
  onTripClick,
  waitingHoverByTripCode = {},
  completedModalByTripCode = {},
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [hoveredAlertId, setHoveredAlertId] = useState<number | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ tripId: number; field: TooltipField } | null>(null);
  const [hoveredWaitingTooltip, setHoveredWaitingTooltip] = useState<{
    tripId: number;
    x: number;
    y: number;
    code: string;
  } | null>(null);
  const [openCompletedTripCode, setOpenCompletedTripCode] = useState<string | null>(null);
  const dropdownRefsMap = useRef<Record<number, HTMLDivElement | null>>({});

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "100%",
    left: 0,
    marginBottom: 4,
    maxWidth: 320,
    background: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0 0 4px rgba(0,0,0,0.16)",
    pointerEvents: "none",
    zIndex: 200,
  };
  const tooltipInnerStyle: React.CSSProperties = {
    padding: "8px 16px",
    background: "#DBEAFE",
    borderRadius: 8,
  };
  const tooltipTextStyle: React.CSSProperties = {
    color: "#78716C",
    fontSize: 12,
    fontFamily: FONT,
    fontWeight: 400,
    lineHeight: "16px",
    letterSpacing: "0.02em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const handleCellMouseEnter = (tripId: number, field: TooltipField) => (e: React.MouseEvent<HTMLDivElement>) => {
    const span = e.currentTarget.querySelector("span");
    if (span && span.scrollWidth > span.clientWidth) {
      setHoveredTooltip({ tripId, field });
    }
  };

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

  const openCompletedTrip = trips.find((trip) => trip.code === openCompletedTripCode);
  const completedBookings = openCompletedTripCode ? (completedModalByTripCode[openCompletedTripCode] ?? []) : [];
  const completedTotalPax = completedBookings.reduce((sum, item) => sum + item.pax, 0);

  return (
    <>
    <div style={{
      display: "flex",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      width: "fit-content",
      maxWidth: "100%",
      overflowX: "auto",
      overflowY: "visible",
      position: "relative",
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
                {/private/i.test(trip.type) ? <PrivateBadge /> : <JoinInBadge />}
              </Cell>

              <Cell width={108} bg={bg}>
                <span style={bodyText()}>{trip.round}</span>
              </Cell>

              <Cell width={266} bg={bg}>
                <div
                  style={{ position: "relative", width: "100%", minWidth: 0 }}
                  onMouseEnter={handleCellMouseEnter(trip.id, "program")}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <span style={{ ...bodyText(idx === 1 ? "#142B41" : "#2A2A2A"), width: "100%", minWidth: 0, display: "block" }}>
                    {trip.program}
                  </span>
                  {hoveredTooltip?.tripId === trip.id && hoveredTooltip?.field === "program" && (
                    <div style={tooltipStyle}>
                      <div style={tooltipInnerStyle}>
                        <span style={tooltipTextStyle}>{trip.program}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Cell>

              <Cell width={206} bg={bg}>
                <div
                  style={{ position: "relative", width: "100%", minWidth: 0 }}
                  onMouseEnter={handleCellMouseEnter(trip.id, "registration")}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <span style={{ ...bodyText(), width: "100%", minWidth: 0, display: "block" }}>
                    {trip.registration}
                  </span>
                  {hoveredTooltip?.tripId === trip.id && hoveredTooltip?.field === "registration" && (
                    <div style={tooltipStyle}>
                      <div style={tooltipInnerStyle}>
                        <span style={tooltipTextStyle}>{trip.registration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Cell>

              <Cell width={206} bg={bg}>
                <div
                  style={{ position: "relative", width: "100%", minWidth: 0 }}
                  onMouseEnter={handleCellMouseEnter(trip.id, "personnel")}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <span style={{ ...bodyText(), width: "100%", minWidth: 0, display: "block" }}>
                    {trip.personnel}
                  </span>
                  {hoveredTooltip?.tripId === trip.id && hoveredTooltip?.field === "personnel" && (
                    <div style={tooltipStyle}>
                      <div style={tooltipInnerStyle}>
                        <span style={tooltipTextStyle}>{trip.personnel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Cell>

              <Cell width={206} bg={bg}>
                <div
                  style={{ position: "relative", width: "100%", minWidth: 0 }}
                  onMouseEnter={handleCellMouseEnter(trip.id, "guide")}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <span style={{ ...bodyText(), width: "100%", minWidth: 0, display: "block" }}>
                    {trip.guide}
                  </span>
                  {hoveredTooltip?.tripId === trip.id && hoveredTooltip?.field === "guide" && (
                    <div style={tooltipStyle}>
                      <div style={tooltipInnerStyle}>
                        <span style={tooltipTextStyle}>{trip.guide}</span>
                      </div>
                    </div>
                  )}
                </div>
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
              <Cell width={80} bg={bg} align="right">
                <div
                  style={{ position: "relative", width: "100%", display: "flex", justifyContent: "flex-end" }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredWaitingTooltip({
                      tripId: trip.id,
                      code: trip.code,
                      x: rect.right,
                      y: rect.bottom + 6,
                    });
                  }}
                  onMouseLeave={() => setHoveredWaitingTooltip((current) => (current?.tripId === trip.id ? null : current))}
                >
                  <span style={bodyText("#BF8F00")}>{trip.waiting}</span>
                </div>
              </Cell>
              <Cell width={100} bg={bg} align="right">
                {(completedModalByTripCode[trip.code]?.length ?? 0) > 0 ? (
                  <span
                    role="button"
                    tabIndex={0}
                    style={{ ...bodyText("#1CB579"), cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setOpenCompletedTripCode(trip.code)}
                    onKeyDown={(e) => e.key === "Enter" && setOpenCompletedTripCode(trip.code)}
                  >
                    {trip.checkedIn}
                  </span>
                ) : (
                  <span style={bodyText("#1CB579")}>{trip.checkedIn}</span>
                )}
              </Cell>
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
    {hoveredWaitingTooltip && (waitingHoverByTripCode[hoveredWaitingTooltip.code]?.length ?? 0) > 0 && (
      <div
        style={{
          position: "fixed",
          top: hoveredWaitingTooltip.y,
          left: hoveredWaitingTooltip.x,
          transform: "translateX(-100%)",
          minWidth: 220,
          maxWidth: 320,
          background: "#FFFFFF",
          border: "1px solid #D9D9D9",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          zIndex: 9999,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div style={{ padding: "6px 0", background: "#FFFFFF" }}>
          {waitingHoverByTripCode[hoveredWaitingTooltip.code].map((booking) => (
            <div
              key={`${hoveredWaitingTooltip.code}-${booking.bookingNo}`}
              style={{
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ ...tooltipTextStyle, color: "#1F2937", whiteSpace: "nowrap" }}>
                {booking.bookingNo}
              </span>
              <span style={{ ...tooltipTextStyle, color: "#1F2937", whiteSpace: "nowrap" }}>
                {booking.pax} Pax
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
    {openCompletedTripCode && openCompletedTrip && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={() => setOpenCompletedTripCode(null)}
      >
        <div
          className="w-[268px] bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative shrink-0 self-stretch pl-6 pr-6 pt-6 pb-3 bg-white inline-flex justify-center items-start gap-2.5">
            <div className="flex-1 inline-flex flex-col justify-start items-center gap-3">
              <div className="self-stretch inline-flex justify-center items-center gap-3">
                <div className="text-center justify-start text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                  Completed
                </div>
              </div>
              <div className="w-52 h-0 outline outline-4 outline-offset-[-2px] outline-blue-300" />
            </div>
            <button
              type="button"
              onClick={() => setOpenCompletedTripCode(null)}
              className="absolute right-4 top-4 size-8 flex items-center justify-center rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <span className="text-3xl leading-none text-zinc-700">×</span>
            </button>
          </div>

          <div className="p-6 inline-flex flex-col justify-center items-center gap-3">
            <div className="self-stretch justify-start text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Trip Code : {openCompletedTrip.code}
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[#d9d9d9]" />
            <div className="flex flex-col justify-center items-start gap-1">
              <div className="self-stretch inline-flex justify-start items-center gap-2.5">
                <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Booking :
                </div>
              </div>
              {completedBookings.map((booking, index) => (
                <div
                  key={`${openCompletedTrip.code}-${booking.bookingNo}-${index}`}
                  className="inline-flex justify-start items-center gap-2.5"
                >
                  <div className="w-[200px] justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    {booking.bookingNo}
                  </div>
                  <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    {booking.pax}
                  </div>
                </div>
              ))}
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[#d9d9d9]" />
            <div className="inline-flex justify-start items-center gap-2.5">
              <div className="w-[200px] justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                Total :
              </div>
              <div className="justify-start text-[#1cb579] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                {completedTotalPax}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default TripTable;
