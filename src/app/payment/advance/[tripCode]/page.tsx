"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  INIT_TRIPS, SEC, STATUS_STYLE, initAdvSections,
  AdvanceSections, ExtraAdvanceItem, SectionKey, CostType,
} from "../../lib/payment-data";

type PageMode = "view" | "edit";

// ─── STAT CARD ICONS ─────────────────────────────────────────────────────────
const IconPaxAdv = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheckedIn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#059669" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="#059669" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconNoShow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#DC2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#DC2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 8l4 4M22 8l-4 4" stroke="#DC2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAmountPax = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#2563EB" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#2563EB" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#2563EB" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── APPROVE MODAL ────────────────────────────────────────────────────────────
function ApproveModal({ tripCode, program, tripRound, guide, totalAdv, onClose, onConfirm }: {
  tripCode: string; program: string; tripRound: string; guide: string; totalAdv: number;
  onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-7 w-[500px] max-w-[95vw] shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">ยืนยัน Approve</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="text-sm text-gray-600 space-y-1.5 leading-relaxed mb-5">
          <div>Trip Code: <strong>{tripCode}</strong></div>
          <div>Program: <strong>{program}</strong></div>
          <div>Trip Round: <strong>{tripRound}</strong></div>
          <div>Guide: <strong>{guide}</strong></div>
          <div>Total Advance: <strong className="text-blue-700">฿{totalAdv.toLocaleString()}</strong></div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">✅ Approve แล้ว ข้อมูลจะส่งไปยัง Expense</div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">✓ Confirm Approve</button>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-7 right-7 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg z-50 flex items-center gap-2 ${
      type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
    }`}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

// ─── SECTION LABELS ──────────────────────────────────────────────────────────
const SECTION_LABELS: Record<SectionKey, string> = {
  guide:     "Guide Fee",
  vehicle:   "Vehicle Cost",
  other:     "Other Expense",
  allowance: "Allowance",
  extra:     "Extra Cost",
};

// ─── SINGLE SECTION VIEW TABLE ────────────────────────────────────────────────
function SectionViewTable({ sectionKey, items, extraItems = [] }: {
  sectionKey: SectionKey;
  items: AdvanceSections[SectionKey];
  extraItems?: ExtraAdvanceItem[];
}) {
  const COLS = ["#", "Items", "Remark", "Option", "Cost Type", "Cost (Unit)", "Pax", "Adv.Cost"];
  const checked = [...items.filter(i => i.checked), ...extraItems.filter(i => i.checked)];
  const total   = checked.reduce((s, i) => s + i.advCost, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#1e2a3a]">
            {COLS.map(h => (
              <th key={h} className={`px-4 py-3 text-left text-xs font-semibold whitespace-nowrap ${
                h === "Pax" || h === "Adv.Cost" ? "text-[#60ADFF]" : "text-gray-300"
              }`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checked.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">ไม่มีรายการ</td></tr>
          )}
          {checked.map((item, i) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
              <td className="px-4 py-3 text-gray-700">{item.name}</td>
              <td className="px-4 py-3 text-gray-400">-</td>
              <td className="px-4 py-3 text-gray-400">-</td>
              <td className="px-4 py-3 text-gray-600">
                {item.costType === "Fix"
                  ? <span>Fix <span className="text-gray-400 text-xs">(0 - {item.pax} Pax)</span></span>
                  : item.costType}
              </td>
              <td className="px-4 py-3 text-gray-700">฿{item.costUnit.toLocaleString()}.00</td>
              <td className="px-4 py-3 text-gray-700">{item.pax}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">{item.advCost.toLocaleString()}.00</td>
            </tr>
          ))}
        </tbody>
        {checked.length > 0 && (
          <tfoot>
            <tr className="border-t border-gray-100">
              <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-blue-600">Total</td>
              <td className="px-4 py-3 text-sm font-bold text-blue-600">{total.toLocaleString()}.00</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ─── EDIT TABLE ───────────────────────────────────────────────────────────────
interface EditTableProps {
  sections: AdvanceSections;
  extraItems: ExtraAdvanceItem[];
  onToggle: (sec: SectionKey, id: string) => void;
  onSetActPax: (sec: SectionKey, id: string, val: string) => void;
  onSetActCost: (sec: SectionKey, id: string, val: string) => void;
}
function EditTable({ sections, extraItems, onToggle, onSetActPax, onSetActCost }: EditTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 40 }} /><col /><col style={{ width: 86 }} />
          <col style={{ width: 50 }} /><col style={{ width: 100 }} />
          <col style={{ width: 110 }} /><col style={{ width: 86 }} /><col style={{ width: 106 }} />
        </colgroup>
        <thead>
          <tr className="bg-[#1e2a3a]">
            {["","รายการ","Cost Type","Pax","Cost/Unit","Adv.Cost","Act.Pax ✎","Act.Cost ✎"].map((h,i) => (
              <th key={i} className={`px-3 py-3 text-left text-xs font-semibold whitespace-nowrap ${
                h.includes("Adv") ? "text-[#60ADFF]" : h.includes("Act") ? "text-blue-300" : "text-gray-300"
              }`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(Object.entries(sections) as [SectionKey, AdvanceSections[SectionKey]][]).map(([key, items]) => {
            const m = SEC[key];
            return [
              <tr key={`hdr-${key}`} style={{ background: m.bg }}>
                <td colSpan={8} style={{ padding: "9px 16px", borderTop: `1px solid ${m.border}`, borderBottom: `1px solid ${m.border}` }}>
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.icon} {m.label}</span>
                </td>
              </tr>,
              ...items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 bg-white" style={{ opacity: item.checked ? 1 : 0.4 }}>
                  <td className="px-3 py-2 text-center align-middle">
                    <input type="checkbox" checked={item.checked} onChange={() => onToggle(key, item.id)}
                      style={{ accentColor: m.accent, width: 15, height: 15, cursor: "pointer" }} />
                  </td>
                  <td className="px-3 py-2 text-gray-700 align-middle">{item.name}</td>
                  <td className="px-3 py-2 text-xs text-gray-400 align-middle">{item.costType}</td>
                  <td className="px-3 py-2 text-center text-gray-600 align-middle">{item.pax}</td>
                  <td className="px-3 py-2 text-right text-gray-600 align-middle">฿{item.costUnit.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700 align-middle">฿{item.advCost.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center align-middle">
                    <input type="number" value={item.actPax} disabled={!item.checked}
                      onChange={e => onSetActPax(key, item.id, e.target.value)}
                      className="rounded-md text-center text-sm font-bold text-blue-700 outline-none w-14 py-1"
                      style={{ border: "1px solid #BFDBFE", background: item.checked ? "#EFF6FF" : "#F8FAFD" }} />
                  </td>
                  <td className="px-2 py-2 text-right align-middle">
                    <input type="number" value={item.actCost} disabled={!item.checked}
                      onChange={e => onSetActCost(key, item.id, e.target.value)}
                      className="rounded-md text-right text-sm outline-none w-24 py-1 px-2"
                      style={{ border: "1px solid #E0E6F0", background: item.checked ? "#fff" : "#F8FAFD" }} />
                  </td>
                </tr>
              )),
            ];
          })}
          {extraItems.map(item => (
            <tr key={item.id} className="border-b border-gray-50 bg-white">
              <td className="px-3 py-2 text-center"><input type="checkbox" checked readOnly style={{ accentColor: "#B45309", width: 15, height: 15 }} /></td>
              <td className="px-3 py-2 text-gray-700">🔸 {item.name}</td>
              <td className="px-3 py-2 text-xs text-gray-400">{item.costType}</td>
              <td className="px-3 py-2 text-center text-gray-600">{item.pax}</td>
              <td className="px-3 py-2 text-right text-gray-600">฿{item.costUnit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-bold text-amber-700">฿{item.advCost.toLocaleString()}</td>
              <td className="px-3 py-2 text-center text-gray-400 text-xs">{item.actPax}</td>
              <td className="px-3 py-2 text-right">฿{item.actCost.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdvanceDetailPage({ params }: { params: Promise<{ tripCode: string }> }) {
  const { tripCode } = use(params);
  const router       = useRouter();
  const trip         = INIT_TRIPS.find(t => t.tripCode === tripCode);

  const [mode, setMode]               = useState<PageMode>("view");
  const [sections, setSections]       = useState<AdvanceSections>(trip ? initAdvSections(trip) : { guide:[], vehicle:[], other:[], allowance:[], extra:[] });
  const [extraItems, setExtraItems]   = useState<ExtraAdvanceItem[]>([]);
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [newExtra, setNewExtra]       = useState({ name: "", costType: "All" as CostType, costUnit: "" });
  const [showApprove, setShowApprove] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [localStatus, setLocalStatus] = useState(trip?.status ?? "Pending");
  const [openSecs, setOpenSecs] = useState<Record<SectionKey, boolean>>({
    guide: true, vehicle: true, other: true, allowance: true, extra: true,
  });
  const toggleSec = (k: SectionKey) => setOpenSecs(p => ({ ...p, [k]: !p[k] }));

  if (!trip) {
    return (
      <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
        <Sidebar /><div className="flex-1 flex flex-col"><Header />
          <main className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
            <div className="text-gray-400">ไม่พบ Trip Code: {tripCode}</div>
          </main><Footer /></div>
      </div>
    );
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleItem  = (sec: SectionKey, id: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, checked: !i.checked } : i) }));
  const setActPax   = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id !== id ? i : { ...i, actPax: Number(val), actCost: i.costType === "Person" ? i.costUnit * Number(val) : i.actCost }) }));
  const setActCost  = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, actCost: Number(val) } : i) }));

  const mainItems   = (["guide","vehicle","other","allowance"] as SectionKey[]).flatMap(k => sections[k]).filter(i => i.checked);
  const totalAdv    = [...mainItems, ...extraItems.filter(i => i.checked)].reduce((s, i) => s + (i.advCost || 0), 0);
  const totalExtra  = [...sections.extra.filter(i => i.checked), ...extraItems.filter(i => i.checked)].reduce((s, i) => s + (i.advCost || 0), 0);
  const grandTotal  = totalAdv + totalExtra;
  const amountPax   = trip.checkedIn - trip.noShow;
  const statusStyle = STATUS_STYLE[localStatus];

  const addExtraItem = () => {
    if (!newExtra.name || !newExtra.costUnit) return;
    const unit = Number(newExtra.costUnit);
    setExtraItems(ex => [...ex, { id: `ex${Date.now()}`, name: newExtra.name, costType: newExtra.costType, costUnit: unit, pax: trip.paxAdv, advCost: newExtra.costType === "Person" ? unit * trip.paxAdv : unit, actPax: trip.checkedIn, actCost: newExtra.costType === "Person" ? unit * trip.checkedIn : unit, checked: true }]);
    setNewExtra({ name: "", costType: "All", costUnit: "" });
    setShowExtraForm(false);
  };

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Top Bar */}
        <div className="bg-white border-b border-[#E7E7E9] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <span>Expense</span><span>›</span>
            <Link href="/payment/advance" className="hover:text-blue-500">Advance</Link>
            <span>›</span>
            <span className="font-semibold text-blue-600">{mode === "view" ? "View" : "Edit"}</span>
          </div>
          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <>
                {/* Export */}
                <button className="flex items-center gap-2 border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  Export
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {/* Close */}
                <button
                  onClick={() => router.push("/payment/advance")}
                  className="border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {/* Edit */}
                <button
                  onClick={() => setMode("edit")}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setMode("view")}
                  className="border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={() => { setMode("view"); showToast("บันทึกเรียบร้อย ✓"); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
                  💾 Save
                </button>
              </>
            )}
          </div>
        </div>

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-5">

          {/* ── Stat Cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Pax No.ADV",  value: trip.paxAdv,  bg: "bg-[#ccfbf1]", Icon: IconPaxAdv   },
              { label: "Checked In",  value: trip.checkedIn, bg: "bg-[#dcfce7]", Icon: IconCheckedIn },
              { label: "No show",     value: trip.noShow,  bg: "bg-[#fee2e2]", Icon: IconNoShow   },
              { label: "Amount Pax",  value: amountPax,    bg: "bg-[#dbeafe]", Icon: IconAmountPax },
            ].map(c => (
              <div key={c.label} className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-start items-start gap-4">
                    <div className="flex-1 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{c.value}</div>
                      <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">{c.label}</div>
                    </div>
                    <div className={`p-2.5 ${c.bg} rounded-xl flex justify-center items-center shrink-0`}>
                      <c.Icon />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Trip Info Card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-[#E7E7E9] px-6 py-5">
            {/* Row 1: badges left, status+pax right */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date */}
                <span className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {trip.date}
                </span>
                {/* Time */}
                <span className="inline-flex items-center gap-1.5 border border-green-200 bg-green-50 rounded-full px-3 py-1 text-sm text-green-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {trip.tripRound}
                </span>
                {/* Trip Type */}
                <span className="inline-flex items-center gap-1.5 border border-blue-200 bg-blue-50 rounded-full px-3 py-1 text-sm text-blue-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                  {trip.tripType}
                </span>
              </div>
              {/* Status + Pax */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: statusStyle.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: statusStyle.color }} />
                  {localStatus}
                </span>
                <span className="text-sm text-gray-500">
                  <svg className="inline mr-1" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                  {trip.checkedIn}/{trip.paxAdv}
                </span>
              </div>
            </div>

            {/* Trip Code */}
            <div className="flex items-center gap-2 mb-3">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/>
              </svg>
              <span className="text-blue-600 font-semibold text-sm">Trip Code No. {trip.tripCode}</span>
            </div>

            {/* Program + Remark */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[110px]">Program name</span>
                <span>:</span>
                <span className="text-gray-800">{trip.program}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[110px]">Remark</span>
                <span>:</span>
                <span className="text-gray-400">-</span>
              </div>
            </div>
          </div>

          {/* ── Main 2-column layout ────────────────────────────────────────── */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>

            {/* Left column */}
            <div className="flex flex-col gap-4">

              {mode === "view" ? (
                <>
                  {(["guide","vehicle","other","allowance","extra"] as SectionKey[]).map(key => {
                    const m = SEC[key];
                    const isOpen = openSecs[key];
                    const extraCount = key === "extra" ? extraItems.length : 0;
                    const totalCount = sections[key].filter(i => i.checked).length + extraCount;
                    return (
                      <div key={key} className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                        <button
                          onClick={() => toggleSec(key)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{m.icon}</span>
                            <span className="font-semibold text-sm" style={{ color: m.color }}>
                              {SECTION_LABELS[key]}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({totalCount} รายการ)
                            </span>
                          </div>
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}
                            className={`transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}>
                            <path d="M18 15l-6-6-6 6"/>
                          </svg>
                        </button>
                        {isOpen && (
                          <SectionViewTable
                            sectionKey={key}
                            items={sections[key]}
                            extraItems={key === "extra" ? extraItems : []}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* ── Add Extra Advance ─────────────────────────────────── */}
                  <div className="bg-white rounded-xl border border-[#E7E7E9] p-4">
                    {!showExtraForm ? (
                      <button
                        onClick={() => setShowExtraForm(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#D97706] border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB] rounded-xl px-4 py-3 hover:bg-[#FEF3C7] transition-colors"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                        </svg>
                        + Add Extra Advance
                      </button>
                    ) : (
                      <div className="border border-[#FCD34D] bg-[#FFFBEB] rounded-xl p-4">
                        <p className="text-sm font-bold text-[#D97706] mb-4">เพิ่ม Extra Advance</p>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">ชื่อรายการ *</label>
                            <input
                              placeholder="เช่น ค่าเข้าชม, ค่าอาหาร..."
                              value={newExtra.name}
                              onChange={e => setNewExtra(p => ({ ...p, name: e.target.value }))}
                              className="border border-[#FCD34D] rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Cost Type</label>
                            <select
                              value={newExtra.costType}
                              onChange={e => setNewExtra(p => ({ ...p, costType: e.target.value as CostType }))}
                              className="border border-[#FCD34D] rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white"
                            >
                              <option value="All">All</option>
                              <option value="Person">Person</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">ราคา (บาท) *</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={newExtra.costUnit}
                              onChange={e => setNewExtra(p => ({ ...p, costUnit: e.target.value }))}
                              className="border border-[#FCD34D] rounded-lg px-3 py-2 text-sm text-right outline-none focus:border-amber-400 bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setShowExtraForm(false); setNewExtra({ name: "", costType: "All", costUnit: "" }); }}
                            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={addExtraItem}
                            disabled={!newExtra.name || !newExtra.costUnit}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            ✓ เพิ่มรายการ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                  <div className="bg-[#1A2340] px-5 py-3 flex items-center gap-3">
                    <span className="text-sm font-bold text-white">💰 Advance Detail</span>
                    <span className="ml-auto text-xs font-semibold rounded-md px-3 py-1 border border-blue-200 bg-blue-50 text-blue-700">
                      💳 Cash = จ่ายก่อน
                    </span>
                  </div>
                  <EditTable sections={sections} extraItems={extraItems} onToggle={toggleItem} onSetActPax={setActPax} onSetActCost={setActCost} />

                  {/* Extra form */}
                  <div className="p-4">
                    {!showExtraForm ? (
                      <button onClick={() => setShowExtraForm(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-amber-700 border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl px-4 py-2.5 hover:bg-amber-100 transition-colors">
                        ➕ ADD EXTRA ADVANCE
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                        <p className="text-sm font-bold text-amber-700 mb-3">เพิ่ม Extra Advance</p>
                        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "1fr 110px 100px" }}>
                          <input placeholder="ชื่อรายการ *" value={newExtra.name} onChange={e => setNewExtra(p => ({ ...p, name: e.target.value }))} className="border border-amber-300 rounded-lg px-3 py-2 text-sm outline-none" />
                          <select value={newExtra.costType} onChange={e => setNewExtra(p => ({ ...p, costType: e.target.value as CostType }))} className="border border-amber-300 rounded-lg px-2 py-2 text-sm outline-none">
                            <option>All</option><option>Person</option>
                          </select>
                          <input type="number" placeholder="ราคา *" value={newExtra.costUnit} onChange={e => setNewExtra(p => ({ ...p, costUnit: e.target.value }))} className="border border-amber-300 rounded-lg px-3 py-2 text-sm text-right outline-none" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={addExtraItem} className="px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600">✓ เพิ่ม</button>
                          <button onClick={() => setShowExtraForm(false)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">ยกเลิก</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.5}>
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  <p className="text-sm font-bold text-blue-600">Summary</p>
                </div>
                <div className="px-5 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Advance Cost</span>
                    <span className="rounded-lg px-3 py-1 text-sm font-semibold bg-[#dbeafe] text-blue-800">
                      ฿{totalAdv.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Extra Advance</span>
                    <span className="rounded-lg px-3 py-1 text-sm font-semibold bg-[#fef9c3] text-yellow-800">
                      ฿{totalExtra.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Total</span>
                    <span className="text-sm font-bold text-gray-800">
                      ฿{grandTotal.toLocaleString()}.00
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
                  <button onClick={() => setShowApprove(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl py-3 transition-colors">
                    ✓ Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {showApprove && (
        <ApproveModal
          tripCode={trip.tripCode} program={trip.program}
          tripRound={trip.tripRound} guide={trip.guide}
          totalAdv={totalAdv}
          onClose={() => setShowApprove(false)}
          onConfirm={() => { setLocalStatus("Approved"); setShowApprove(false); showToast("Approve เรียบร้อย ✓"); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
