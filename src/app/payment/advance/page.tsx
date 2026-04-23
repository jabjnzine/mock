"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { INIT_TRIPS, Trip } from "../lib/payment-data";
import {
  advanceApplyClientTripStatus,
  advanceClearCompletedTabFlag,
  advanceMarkTripStatus,
  advanceReadInitialCompletedTab,
  advanceResolveExtraAdvTotal,
  advanceResolveMainAdvTotal,
  advanceSetTripSlipPreviewSrc,
} from "../lib/advance-client-state";
import TripTypeBadge from "../components/TripTypeBadge";
import { PAYMENT_BANK_COLOR, formatPaymentMoney } from "../components/payment-table-styles";
import { AttachmentSlipModal } from "../components/AttachmentSlipModal";

type SlipInfo = { preview: boolean; extraCount?: number };

const ROW_SLIPS: Record<string, SlipInfo> = {
  EC25Z1PW: { preview: false },
  EC2581C4: { preview: true },
  EC25DM35: { preview: false },
  EC255D2C: { preview: true },
  EC25PV01: { preview: false },
  EC25PV02: { preview: true, extraCount: 2 },
  EC25ABC1: { preview: true },
  TF25Z1PW: { preview: false },
};

const BANK_COLOR = PAYMENT_BANK_COLOR;
const formatMoney = formatPaymentMoney;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IconAmountTrip = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M2 19.5V7.625C2 6.133 2.593 4.702 3.648 3.648C4.702 2.593 6.133 2 7.625 2H16.375C17.114 2 17.845 2.145 18.528 2.428C19.21 2.711 19.83 3.125 20.353 3.648C20.875 4.17 21.289 4.79 21.572 5.472C21.855 6.155 22 6.886 22 7.625V16.375C22 17.114 21.855 17.845 21.572 18.528C21.289 19.21 20.875 19.83 20.353 20.353C19.83 20.875 19.21 21.289 18.528 21.572C17.845 21.855 17.114 22 16.375 22H4.5C3.837 22 3.201 21.737 2.732 21.268C2.263 20.799 2 20.163 2 19.5Z" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12H11.375C12.038 12 12.674 12.263 13.143 12.732C13.612 13.201 13.875 13.837 13.875 14.5C13.875 15.163 13.612 15.799 13.143 16.268C12.674 16.737 12.038 17 11.375 17H7V8.25C7 7.918 7.132 7.601 7.366 7.366C7.601 7.132 7.918 7 8.25 7H10.125C10.788 7 11.424 7.263 11.893 7.732C12.362 8.201 12.625 8.837 12.625 9.5C12.625 10.163 12.362 10.799 11.893 11.268C11.424 11.737 10.788 12 10.125 12H8.25M17 17H17.012" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTotalAdvance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 6V8M12 16V18" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 9.5C8.5 8.119 9.619 7 11 7H13C14.105 7 15 7.895 15 9C15 10.105 14.105 11 13 11H11C9.895 11 9 11.895 9 13C9 14.105 9.895 15 11 15H13C14.381 15 15.5 13.881 15.5 12.5" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconExtraAdvance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#D97706" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V16M8 12H16" stroke="#D97706" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconGrandTotal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M19 7H5C3.343 7 2 8.343 2 10V19C2 20.657 3.343 22 5 22H19C20.657 22 22 20.657 22 19V10C22 8.343 20.657 7 19 7Z" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7V6C16 4.343 14.657 3 13 3H11C9.343 3 8 4.343 8 6V7" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 14C15 14.796 14.684 15.559 14.121 16.121C13.559 16.684 12.796 17 12 17C11.204 17 10.441 16.684 9.879 16.121C9.316 15.559 9 14.796 9 14C9 13.204 9.316 12.441 9.879 11.879C10.441 11.316 11.204 11 12 11C12.796 11 13.559 11.316 14.121 11.879C14.684 12.441 15 13.204 15 14Z" stroke="#1CB579" strokeWidth={1.5} />
  </svg>
);

// ─── ACTION DROPDOWN (Pending: View / Approve / Print — Completed: View / Add Slip / Print) ─
function IconActionView() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="#2a2a2a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#2a2a2a" strokeWidth={1.5} />
    </svg>
  );
}

function IconActionApprove() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#292d32" strokeWidth={1.5} />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#292d32" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconActionPrint() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
        stroke="#2a2a2a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 14h12" stroke="#2a2a2a" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function IconActionAddSlip() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="#2a2a2a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ไอคอน Export — ตรงดีไซน์ Blue Primary / linear */
function IconExportPayment() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-white"
      aria-hidden
    >
      <path
        d="M12 4v12M8 8l4-4 4 4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

const actionMenuRowClass =
  "w-[164px] px-3 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-gray-50 text-[#2a2a2a] font-['IBM_Plex_Sans_Thai'] text-base font-normal leading-6 tracking-tight transition-colors";
const actionMenuPanelClass =
  "absolute right-0 top-9 z-20 w-[164px] overflow-hidden rounded bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] inline-flex flex-col justify-start items-start";

type ActionMenuVariant = "pending" | "completed";

function ActionMenu({
  tripCode,
  variant,
  onApprove,
  onAddSlip,
}: {
  tripCode: string;
  variant: ActionMenuVariant;
  onApprove?: () => void;
  /** completed: เปิด modal แนบสลิปบนหน้ารายการ โดยไม่นำทาง */
  onAddSlip?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    setOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#142b41] transition-colors hover:bg-gray-100"
        aria-label="เมนู"
        aria-expanded={open}
      >
        <span className="flex items-center justify-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-[#142b41]" />
          <span className="h-1 w-1 rounded-full bg-[#142b41]" />
          <span className="h-1 w-1 rounded-full bg-[#142b41]" />
        </span>
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className={actionMenuPanelClass} role="menu">
            <Link
              href={`/payment/advance/${tripCode}`}
              className={actionMenuRowClass}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <IconActionView />
              <span className="flex-1 text-left">View</span>
            </Link>
            {variant === "pending" ? (
              <button
                type="button"
                className={`${actionMenuRowClass} w-[164px] cursor-pointer border-0 text-left`}
                role="menuitem"
                onClick={() => {
                  onApprove?.();
                  setOpen(false);
                }}
              >
                <IconActionApprove />
                <span className="flex-1">Approve</span>
              </button>
            ) : (
              <button
                type="button"
                className={`${actionMenuRowClass} w-[164px] cursor-pointer border-0 text-left`}
                role="menuitem"
                onClick={() => {
                  onAddSlip?.();
                  setOpen(false);
                }}
              >
                <IconActionAddSlip />
                <span className="flex-1 text-left">Add Slip</span>
              </button>
            )}
            <button
              type="button"
              className={`${actionMenuRowClass} w-[164px] cursor-pointer border-0 text-left`}
              role="menuitem"
              onClick={handlePrint}
            >
              <IconActionPrint />
              <span className="flex-1">Print</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── COMPLETED TAB TABLE (โครงสร้างตามดีไซน์) ─────────────────────────────────
function AdvanceCompletedTable({
  rows,
  rowSlips,
  onAddSlip,
}: {
  rows: Trip[];
  rowSlips: Record<string, SlipInfo>;
  onAddSlip: (trip: Trip) => void;
}) {
  const totalAdvance = rows.reduce((s, t) => s + advanceResolveMainAdvTotal(t), 0);
  const totalExtra   = rows.reduce((s, t) => s + advanceResolveExtraAdvTotal(t), 0);
  const grandTotal   = totalAdvance + totalExtra;

  const th = "h-11 p-2 border-l border-white flex items-center text-white text-base font-medium leading-6 tracking-tight shrink-0";
  const tdNum = "text-[#2a2a2a] text-base font-normal leading-6 tracking-tight";

  return (
    <div className="w-full max-w-full inline-flex flex-col items-stretch gap-6 font-['IBM_Plex_Sans_Thai']">
      <div className="w-full bg-white rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] flex flex-col overflow-hidden overflow-x-auto">
        {/* Header */}
        <div className="min-w-[1100px] w-full rounded-tl-lg rounded-tr-lg inline-flex justify-start items-stretch overflow-hidden">
          <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center shrink-0 text-white text-base font-medium leading-6 tracking-tight">#</div>
          <div className={`w-[130px] bg-[#142b41] ${th} justify-start`}>Trip Code</div>
          <div className={`w-[104px] bg-[#142b41] ${th} justify-center`}>Trip Type</div>
          <div className={`flex-1 min-w-[120px] bg-[#142b41] ${th} justify-start`}>Program</div>
          <div className={`w-[200px] bg-[#142b41] ${th} justify-start`}>Guide</div>
          <div className={`w-[200px] bg-[#142b41] ${th} justify-start`}>Book Bank</div>
          <div className={`w-[68px] bg-[#142b41] ${th} justify-end`}>Pax</div>
          <div className={`w-[120px] bg-[#265ed6] ${th} justify-end`}>Advance</div>
          <div className={`w-[120px] bg-[#fd5c04] ${th} justify-end`}>Extra Advance</div>
          <div className={`w-[120px] bg-[#97bee4] ${th} justify-end`}>Total</div>
          <div className={`w-20 bg-[#142b41] ${th} justify-center`}>Slip</div>
          <div className={`w-20 bg-[#142b41] ${th} justify-center`}>Action</div>
        </div>

        {/* Rows */}
        {rows.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">ไม่พบข้อมูล</div>
        )}
        {rows.map((t, i) => {
          const adv = advanceResolveMainAdvTotal(t);
          const ex  = advanceResolveExtraAdvTotal(t);
          const rowBg = i % 2 === 1 ? "bg-[#f8f8f8]" : "bg-white";
          const slip = rowSlips[t.tripCode] ?? { preview: false };
          const slipExtra = slip.extraCount;
          const bankColor = BANK_COLOR[t.bankName] ?? "#265ED6";
          return (
            <div key={t.id} className={`min-w-[1100px] w-full inline-flex justify-start items-stretch ${rowBg}`}>
              <div className={`w-16 h-16 p-2 flex justify-center items-center shrink-0 ${rowBg}`}>
                <span className={tdNum}>{i + 1}</span>
              </div>
              <div className={`w-[130px] h-16 p-2 border-l border-[#d9d9d9] flex items-center shrink-0 ${rowBg}`}>
                <Link href={`/payment/advance/${t.tripCode}`} className="text-[#265ed6] text-base font-normal underline leading-6 tracking-tight line-clamp-1">
                  {t.tripCode}
                </Link>
              </div>
              <div className={`w-[104px] h-16 p-2 border-l border-[#d9d9d9] flex justify-center items-center shrink-0 ${rowBg}`}>
                <TripTypeBadge tripType={t.tripType} />
              </div>
              <div className={`flex-1 min-w-[120px] h-16 p-2 border-l border-[#d9d9d9] flex items-center shrink-0 ${rowBg}`}>
                <span className={`flex-1 ${tdNum} line-clamp-1`}>{t.program}</span>
              </div>
              <div className={`w-[200px] h-16 p-2 border-l border-[#d9d9d9] flex items-center shrink-0 ${rowBg}`}>
                <span className={`flex-1 ${tdNum} line-clamp-1`}>{t.guide}</span>
              </div>
              <div className={`w-[200px] h-16 p-2 border-l border-[#d9d9d9] flex items-start gap-2 shrink-0 ${rowBg}`}>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] mt-0.5 shrink-0"
                  style={{ backgroundColor: bankColor }}
                >
                  ฿
                </span>
                <span className={`flex-1 min-w-0 ${tdNum} line-clamp-2`}>
                  {t.bankNo} {t.guide}
                </span>
              </div>
              <div className={`w-[68px] h-16 p-2 border-l border-[#d9d9d9] flex justify-end items-center shrink-0 ${rowBg}`}>
                <span className={tdNum}>{t.paxAdv}</span>
              </div>
              <div className={`w-[120px] h-16 p-2 border-l border-[#d9d9d9] flex justify-end items-center shrink-0 ${rowBg}`}>
                <span className={`flex-1 text-right ${tdNum} line-clamp-1 tabular-nums`}>{formatMoney(adv)}</span>
              </div>
              <div className={`w-[120px] h-16 p-2 border-l border-[#d9d9d9] flex justify-end items-center shrink-0 ${rowBg}`}>
                <span className={`flex-1 text-right ${tdNum} line-clamp-1 tabular-nums`}>{formatMoney(ex)}</span>
              </div>
              <div className={`w-[120px] h-16 p-2 border-l border-[#d9d9d9] flex justify-end items-center shrink-0 ${rowBg}`}>
                <span className={`flex-1 text-right ${tdNum} line-clamp-1 tabular-nums`}>{formatMoney(adv + ex)}</span>
              </div>
              <div className="w-20 h-16 p-2 bg-[#f8f8f8] border-l border-[#d9d9d9] flex justify-center items-center shrink-0">
                {!slip.preview ? (
                  <div className="w-8 h-8 bg-white rounded border border-[#d9d9d9]" />
                ) : (
                  <div className="w-8 h-8 relative rounded border border-[#d9d9d9] overflow-hidden bg-[#ececec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://placehold.co/32x32/ececec/999/png?text=·" alt="" className="w-8 h-8 object-cover" />
                    {slipExtra ? (
                      <>
                        <div className="absolute inset-0 bg-[#848484]/50 rounded" />
                        <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold leading-7 tracking-tight">
                          +{slipExtra}
                        </span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
              <div className={`w-20 h-16 px-[18px] py-4 border-l border-[#d9d9d9] inline-flex flex-col justify-center items-center shrink-0 ${rowBg}`}>
                <ActionMenu tripCode={t.tripCode} variant="completed" onAddSlip={() => onAddSlip(t)} />
              </div>
            </div>
          );
        })}

        {/* Footer — Total ในคอลัมน์ #; ยอด Advance น้ำเงิน / Extra ส้ม / Total ดำ ตัวหนา ตรงหัวคอลัมน์ */}
        {rows.length > 0 && (
          <div className="min-w-[1100px] w-full inline-flex justify-start items-stretch border-t border-[#d9d9d9] bg-white">
            <div className="w-16 min-h-12 p-2 flex justify-center items-center shrink-0 bg-white">
              <span className="text-[#265ed6] text-base font-bold leading-6 tracking-tight">Total</span>
            </div>
            <div className="w-[130px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-[104px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="flex-1 min-w-[120px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-[200px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-[200px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-[68px] min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-[120px] min-h-12 px-2 py-3 flex justify-end items-center shrink-0 bg-white">
              <span className="text-right text-[#265ed6] text-base font-bold leading-6 tracking-tight tabular-nums">
                {formatMoney(totalAdvance)}
              </span>
            </div>
            <div className="w-[120px] min-h-12 px-2 py-3 flex justify-end items-center shrink-0 bg-white">
              <span className="text-right text-[#fd5c04] text-base font-bold leading-6 tracking-tight tabular-nums">
                {formatMoney(totalExtra)}
              </span>
            </div>
            <div className="w-[120px] min-h-12 px-2 py-3 flex justify-end items-center shrink-0 bg-white">
              <span className="text-right text-[#1a1a1a] text-base font-bold leading-6 tracking-tight tabular-nums">
                {formatMoney(grandTotal)}
              </span>
            </div>
            <div className="w-20 min-h-12 shrink-0 bg-white" aria-hidden />
            <div className="w-20 min-h-12 shrink-0 bg-white" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdvanceListPage() {
  const [trips, setTrips] = useState<Trip[]>(() =>
    advanceApplyClientTripStatus(INIT_TRIPS.map(t => ({ ...t }))),
  );
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">(() =>
    typeof window !== "undefined" && advanceReadInitialCompletedTab() ? "Completed" : "Pending",
  );
  const [search, setSearch] = useState("");
  const [date, setDate]     = useState("17/12/2025");
  const [slipModalTrip, setSlipModalTrip] = useState<Trip | null>(null);
  /** แถว Pending ที่เลือกจาก checkbox (trip id) */
  const [pendingSelectedIds, setPendingSelectedIds] = useState<Set<number>>(() => new Set());
  const pendingSelectAllRef = useRef<HTMLInputElement>(null);

  /** ซิงก์จาก mock + override ใน memory; ลบธงแท็บหลัง mount (setTimeout 0 ให้ Strict Mode อ่านซ้ำได้); รีเฟรช = beforeunload ลบธง */
  useEffect(() => {
    const onBeforeUnload = () => advanceClearCompletedTabFlag();
    window.addEventListener("beforeunload", onBeforeUnload);
    setTrips(advanceApplyClientTripStatus(INIT_TRIPS.map(t => ({ ...t }))));
    const t = window.setTimeout(() => advanceClearCompletedTabFlag(), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "Pending") return;
    const pendingIdSet = new Set(trips.filter(t => t.status === "Pending").map(t => t.id));
    setPendingSelectedIds(prev => {
      let changed = false;
      const next = new Set<number>();
      prev.forEach(id => {
        if (pendingIdSet.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [trips, activeTab]);

  useEffect(() => {
    if (activeTab === "Completed") setPendingSelectedIds(new Set());
  }, [activeTab]);

  /** Pending = รอดำเนินการ; Completed = อนุมัติ/จบแล้ว — Approve แล้วแถวจะหายจาก Pending ไปอยู่ Completed */
  const pending   = trips.filter(t => t.status === "Pending");
  const completed = trips.filter(t => t.status === "Approved" || t.status === "Completed");
  const source = activeTab === "Pending" ? pending : completed;

  const tableHeaders = [
    "#",
    "Trip Code",
    "Travel Date",
    "Trip Type",
    "Trip Round",
    "Program",
    "Guide",
    "Book Bank",
    "Pax",
    "Advance",
    "Action",
  ] as const;

  const shown = source.filter(t =>
    t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
    t.program.toLowerCase().includes(search.toLowerCase()) ||
    t.guide.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdv      = trips.reduce((s, t) => s + advanceResolveMainAdvTotal(t), 0);
  const totalExtraAdv = trips.reduce((s, t) => s + advanceResolveExtraAdvTotal(t), 0);
  const grandTotal    = totalAdv + totalExtraAdv;
  const shownTotal    = shown.reduce((s, t) => s + advanceResolveMainAdvTotal(t), 0);

  const handleApprove = (id: number) => {
    const row = INIT_TRIPS.find(t => t.id === id);
    if (row) advanceMarkTripStatus(row.tripCode, "Approved");
    setTrips(advanceApplyClientTripStatus(INIT_TRIPS.map(t => ({ ...t }))));
    setPendingSelectedIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const togglePendingRowSelected = (id: number) => {
    setPendingSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shownPendingIds = shown.map(t => t.id);
  const allShownPendingSelected =
    shownPendingIds.length > 0 && shownPendingIds.every(id => pendingSelectedIds.has(id));
  const someShownPendingSelected = shownPendingIds.some(id => pendingSelectedIds.has(id));

  useEffect(() => {
    const el = pendingSelectAllRef.current;
    if (!el) return;
    el.indeterminate = someShownPendingSelected && !allShownPendingSelected;
  }, [someShownPendingSelected, allShownPendingSelected]);

  const toggleSelectAllShownPending = () => {
    setPendingSelectedIds(prev => {
      const next = new Set(prev);
      if (allShownPendingSelected) {
        shownPendingIds.forEach(id => next.delete(id));
      } else {
        shownPendingIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleBulkApprove = () => {
    pendingSelectedIds.forEach(id => {
      const row = INIT_TRIPS.find(t => t.id === id);
      if (row) advanceMarkTripStatus(row.tripCode, "Approved");
    });
    setTrips(advanceApplyClientTripStatus(INIT_TRIPS.map(t => ({ ...t }))));
    setPendingSelectedIds(new Set());
  };

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-6 items-end">
          {/* Header + Controls */}
          <div className="w-full inline-flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#B9B9B9] text-base font-medium">Payment</span>
              <span className="text-[#2A2A2A]">›</span>
              <span className="text-[#265ED6] text-lg font-semibold">Advance</span>
            </div>
            <div className="inline-flex items-center gap-4">
              <div className="w-80 flex items-center gap-2 bg-white rounded-lg border border-[#D9D9D9] px-3 py-2">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" className="text-[#2A2A2A]">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="flex-1 outline-none text-base text-[#2A2A2A]"
                />
              </div>
              <div className="w-80 flex items-center gap-2 bg-white rounded-lg border border-[#D9D9D9] px-3 py-2">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" className="text-[#2A2A2A]">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Enter search"
                  className="flex-1 outline-none text-base text-[#2A2A2A] placeholder:text-[#B9B9B9]"
                />
              </div>
              {activeTab === "Completed" ? (
                <button
                  type="button"
                  className="px-5 py-2 bg-[#265ed6] rounded-[100px] inline-flex justify-center items-center gap-2 shrink-0 text-white hover:opacity-95 font-['IBM_Plex_Sans_Thai']"
                  aria-label="Export Payment"
                >
                  <IconExportPayment />
                  <span className="text-center text-base font-medium leading-6 tracking-tight">
                    Export Payment
                  </span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="w-full grid grid-cols-4 gap-6">
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{pending.length}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Amount Trip</div>
                  </div>
                  <div className="p-2.5 bg-[#DCEEFF] rounded-xl flex justify-center items-center shrink-0">
                    <IconAmountTrip />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(totalAdv)}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Advance</div>
                  </div>
                  <div className="p-2.5 bg-[#FFF5D9] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalAdvance />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(totalExtraAdv)}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Extra Advance</div>
                  </div>
                  <div className="p-2.5 bg-[#FFCAAD] rounded-xl flex justify-center items-center shrink-0">
                    <IconExtraAdvance />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(grandTotal)}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total</div>
                  </div>
                  <div className="p-2.5 bg-[#e6f3e6] rounded-xl flex justify-center items-center shrink-0">
                    <IconGrandTotal />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + bulk Approve แถวเดียวกัน */}
          <div className="w-full flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-transparent">
            <div className="flex flex-wrap items-end">
              {(["Pending", "Completed"] as const).map(tab => {
                const cnt = tab === "Pending" ? pending.length : completed.length;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`p-2 mr-4 border-b-4 inline-flex items-center gap-2 ${
                      activeTab === tab ? "border-[#FE7931] text-[#265ED6]" : "border-transparent text-[#142B41]"
                    }`}
                  >
                    <span className="text-base font-medium">{tab}</span>
                    <span className="px-[7px] rounded-md bg-[#265ED6] text-white text-base font-medium leading-6">
                      {cnt}
                    </span>
                  </button>
                );
              })}
            </div>
            {activeTab === "Pending" && pendingSelectedIds.size > 0 ? (
              <div className="flex items-center gap-4 pb-2 shrink-0">
                <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  {pendingSelectedIds.size} Selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-5 py-2 bg-[#265ED6] rounded-[100px] text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight hover:opacity-95"
                >
                  Approve
                </button>
              </div>
            ) : null}
          </div>

          {/* ตาราง: Completed = โครงสร้างตามดีไซน์ / Pending = ตารางเดิม (มี Travel Date, Trip Round) */}
          {activeTab === "Completed" ? (
            <AdvanceCompletedTable
              rows={shown}
              rowSlips={ROW_SLIPS}
              onAddSlip={t => setSlipModalTrip(t)}
            />
          ) : (
            <div className="w-full bg-white rounded-lg border border-[#D9D9D9] overflow-hidden">
              <div className="overflow-x-auto overflow-hidden">
                <table className="w-full table-fixed border-collapse min-w-[1000px]">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-[130px]" />
                    <col className="w-[108px]" />
                    <col className="w-[104px]" />
                    <col className="w-[108px]" />
                    <col />
                    <col className="w-[200px]" />
                    <col className="w-[200px]" />
                    <col className="w-[68px]" />
                    <col className="w-[150px]" />
                    <col className="w-20" />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#142B41] text-white h-11">
                      {tableHeaders.map((h, i) => (
                        <th
                          key={`${h}-${i}`}
                          className={`p-2 h-11 text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap ${
                            i > 0 ? "border-l border-white" : ""
                          } ${h === "Advance" ? "bg-[#265ED6]" : ""} ${
                            h === "#" || h === "Trip Type" || h === "Action"
                              ? "text-center"
                              : h === "Pax" || h === "Advance"
                                ? "text-right"
                                : "text-left"
                          }`}
                        >
                          {h === "#" ? (
                            <input
                              ref={pendingSelectAllRef}
                              type="checkbox"
                              checked={allShownPendingSelected}
                              onChange={toggleSelectAllShownPending}
                              disabled={shown.length === 0}
                              className="h-4 w-4 cursor-pointer rounded border-white/40 bg-white/10 accent-[#265ED6] focus:ring-2 focus:ring-white/80"
                              aria-label="เลือกทั้งหมดในหน้านี้"
                            />
                          ) : (
                            h
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.length === 0 && (
                      <tr>
                        <td colSpan={tableHeaders.length} className="py-12 text-center text-gray-400">ไม่พบข้อมูล</td>
                      </tr>
                    )}
                    {shown.map((t: Trip, i: number) => {
                      const adv = advanceResolveMainAdvTotal(t);
                      const bankColor = BANK_COLOR[t.bankName] ?? "#265ED6";
                      return (
                        <tr key={t.id} className={`h-16 border-b border-[#D9D9D9] ${i % 2 === 1 ? "bg-[#F8F8F8]" : "bg-white"}`}>
                          <td className="p-2 h-16 border-[#D9D9D9]">
                            <div className="flex h-full items-center justify-center gap-2">
                              <input
                                type="checkbox"
                                checked={pendingSelectedIds.has(t.id)}
                                onChange={() => togglePendingRowSelected(t.id)}
                                className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#D9D9D9] accent-[#265ED6]"
                                aria-label={`เลือก ${t.tripCode}`}
                              />
                              <span className="text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight tabular-nums">
                                {i + 1}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9]">
                            <Link href={`/payment/advance/${t.tripCode}`} className="text-[#265ED6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6 tracking-tight">
                              {t.tripCode}
                            </Link>
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap">{t.date}</td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9]">
                            <TripTypeBadge tripType={t.tripType} />
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap">{t.tripRound.replace(":", " : ")}</td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-[#2A2A2A]">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{t.program}</div>
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-[#2A2A2A]">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{t.guide}</div>
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-[#2A2A2A]">
                            <div className="flex items-start gap-2">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] mt-0.5 shrink-0"
                                style={{ backgroundColor: bankColor }}
                              >
                                ฿
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                  {t.bankNo}
                                </div>
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                  {t.guide}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-right text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{t.paxAdv}</td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-right text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap">
                            {formatMoney(adv)}
                          </td>
                          <td className="p-2 h-16 border-l border-[#D9D9D9] text-center">
                            <ActionMenu
                              tripCode={t.tripCode}
                              variant="pending"
                              onApprove={() => handleApprove(t.id)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {shown.length > 0 && (
                    <tfoot>
                      <tr className="h-12 border-t border-[#D9D9D9] bg-white">
                        <td colSpan={9} className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Total</td>
                        <td className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight text-right whitespace-nowrap">
                          {formatMoney(shownTotal)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Pagination (outside table card) */}
          <div className="w-full flex items-center justify-end gap-4 px-5">
            <button className="h-6 px-2 bg-white rounded border border-[#B9B9B9] inline-flex items-center gap-1 text-sm text-[#3E3939]">
              15 / page <span className="text-[10px]">▼</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939]">‹</button>
              <button className="w-6 h-6 rounded bg-[#2A4B6A] text-white text-sm">1</button>
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">2</button>
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">…</button>
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">9</button>
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">10</button>
              <button className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939]">›</button>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {slipModalTrip ? (
        <AttachmentSlipModal
          open
          onClose={() => setSlipModalTrip(null)}
          trip={slipModalTrip}
          localStatus={slipModalTrip.status}
          grandTotal={
            advanceResolveMainAdvTotal(slipModalTrip) + advanceResolveExtraAdvTotal(slipModalTrip)
          }
          onConfirmSuccess={src => {
            advanceSetTripSlipPreviewSrc(slipModalTrip.tripCode, src);
            setSlipModalTrip(null);
          }}
        />
      ) : null}
    </div>
  );
}
