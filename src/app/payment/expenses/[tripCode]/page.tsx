"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  INIT_TRIPS, SEC, initExpSections,
  ExpenseSections, SectionKey, PaymentType,
} from "../../lib/payment-data";

// ─── PAXBAR ───────────────────────────────────────────────────────────────────
function PaxBar({ paxAdv, checkedIn, noShow }: { paxAdv: number; checkedIn: number; noShow: number }) {
  const amountPax = checkedIn - noShow;
  const cells = [
    { label: "Pax No.ADV", value: paxAdv,    bg: "bg-blue-100",   color: "text-blue-800"   },
    { label: "Checked In", value: checkedIn,  bg: "bg-orange-100", color: "text-orange-800" },
    { label: "No Show",    value: noShow,     bg: "bg-red-100",    color: "text-red-800"    },
    { label: "Amount PAX", value: amountPax,  bg: "bg-green-100",  color: "text-green-800"  },
  ];
  return (
    <div className="grid grid-cols-4 rounded-xl overflow-hidden border border-[#E7E7E9] mb-4">
      {cells.map(c => (
        <div key={c.label} className={`${c.bg} ${c.color} py-3 px-4 text-center`}>
          <p className="text-xs font-medium opacity-70 mb-0.5">{c.label}</p>
          <p className="text-3xl font-black">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── PROGRAM INFO CARD ────────────────────────────────────────────────────────
function ProgramInfoCard({ program, tripRound, tripType, option, date, tripCode }: {
  program: string; tripRound: string; tripType: string; option: string; date: string; tripCode: string;
}) {
  const fields = [
    { label: "Program",    value: program,    span: 2 },
    { label: "Trip Round", value: tripRound,  span: 1 },
    { label: "Trip Type",  value: tripType,   span: 1 },
    { label: "Option",     value: option,     span: 1 },
    { label: "Date",       value: date,       span: 1 },
    { label: "Trip Code",  value: tripCode,   span: 1 },
  ];
  return (
    <div className="bg-white rounded-xl border border-[#E7E7E9] p-5 mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">📋 Program Info</p>
      <div className="grid grid-cols-4 gap-x-5 gap-y-3">
        {fields.map(f => (
          <div key={f.label} style={{ gridColumn: `span ${f.span}` }}>
            <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
            <p className="text-sm font-semibold text-gray-800">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAYMENT BADGE ────────────────────────────────────────────────────────────
function PaymentBadge({ type }: { type: PaymentType }) {
  const isCash = type === "Cash";
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap border"
      style={{
        background: isCash ? "#DBEAFE" : "#EDE9FE",
        color: isCash ? "#1E40AF" : "#5B21B6",
        borderColor: isCash ? "#BFDBFE" : "#DDD6FE",
      }}
    >
      {isCash ? "💳 Cash" : "📋 Credit"}
    </span>
  );
}

// ─── EXPENSE SECTIONS TABLE ───────────────────────────────────────────────────
interface ExpSectionsTableProps {
  sections: ExpenseSections;
  onToggle: (sec: SectionKey, id: string) => void;
  onSetActPax: (sec: SectionKey, id: string, val: string) => void;
  onSetActCost: (sec: SectionKey, id: string, val: string) => void;
}

function ExpenseSectionsTable({ sections, onToggle, onSetActPax, onSetActCost }: ExpSectionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 40 }} />
          <col />
          <col style={{ width: 100 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 86 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 86 }} />
          <col style={{ width: 110 }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 border-b border-gray-200" />
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 border-b border-gray-200">รายการ</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 border-b border-gray-200">Payment</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 border-b border-gray-200">Supplier</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 border-b border-gray-200">Cost Type</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-400 border-b border-gray-200">Cost/Unit</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-blue-400 border-b border-gray-200">Act.Pax ✎</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-blue-400 border-b border-gray-200">Act.Cost ✎</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(sections) as [SectionKey, ExpenseSections[SectionKey]][]).map(([key, items]) => {
            const m = SEC[key];
            const checkedCount = items.filter(i => i.checked).length;
            const cashCount    = items.filter(i => i.payment === "Cash").length;
            const creditCount  = items.filter(i => i.payment === "Credit").length;
            return [
              <tr key={`hdr-${key}`} style={{ background: m.bg }}>
                <td colSpan={8} style={{ padding: "9px 16px", borderTop: `1px solid ${m.border}`, borderBottom: `1px solid ${m.border}` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: m.color }}>{m.icon} {m.label}</span>
                    <span className="text-xs opacity-50" style={{ color: m.color }}>({checkedCount}/{items.length})</span>
                    <div className="ml-auto flex gap-1.5">
                      {cashCount > 0 && (
                        <span className="text-xs font-semibold rounded-md px-2 py-0.5 border border-blue-200 bg-blue-50 text-blue-700">
                          💳 Cash ×{cashCount}
                        </span>
                      )}
                      {creditCount > 0 && (
                        <span className="text-xs font-semibold rounded-md px-2 py-0.5 border border-violet-200 bg-violet-50 text-violet-700">
                          📋 Credit ×{creditCount}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>,
              ...items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 bg-white" style={{ opacity: item.checked ? 1 : 0.35 }}>
                  <td className="px-3 py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggle(key, item.id)}
                      style={{ accentColor: m.accent, width: 15, height: 15, cursor: "pointer" }}
                    />
                  </td>
                  <td className="px-3 py-2 text-gray-700 align-middle">{item.name}</td>
                  <td className="px-2 py-2 text-center align-middle"><PaymentBadge type={item.payment} /></td>
                  <td className="px-3 py-2 text-xs text-gray-400 align-middle">{item.supplier === "-" ? "—" : item.supplier}</td>
                  <td className="px-3 py-2 text-xs text-gray-400 align-middle">{item.costType}</td>
                  <td className="px-3 py-2 text-right text-gray-600 align-middle">฿{item.costUnit.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center align-middle">
                    {item.costType === "Person" ? (
                      <input
                        type="number"
                        value={item.actPax}
                        disabled={!item.checked}
                        onChange={e => onSetActPax(key, item.id, e.target.value)}
                        className="rounded-md text-center text-sm font-bold text-blue-700 outline-none w-14 py-1"
                        style={{ border: "1px solid #BFDBFE", background: item.checked ? "#EFF6FF" : "#F8FAFD" }}
                      />
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right align-middle">
                    <input
                      type="number"
                      value={item.actCost}
                      disabled={!item.checked}
                      onChange={e => onSetActCost(key, item.id, e.target.value)}
                      className="rounded-md text-right text-sm outline-none w-24 py-1 px-2"
                      style={{ border: "1px solid #E0E6F0", background: item.checked ? "#fff" : "#F8FAFD" }}
                    />
                  </td>
                </tr>
              )),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── APPROVE MODAL ────────────────────────────────────────────────────────────
function ApproveModal({ tripCode, program, totalCash, totalCredit, grandTotal, onClose, onConfirm }: {
  tripCode: string; program: string; totalCash: number; totalCredit: number; grandTotal: number;
  onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-7 w-[500px] max-w-[95vw] shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">ยืนยัน Approve Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="text-sm text-gray-600 space-y-1.5 leading-relaxed mb-5">
          <div>Trip: <strong>{tripCode}</strong></div>
          <div>Program: <strong>{program}</strong></div>
          <div>Total Cash: <strong className="text-blue-700">฿{totalCash.toLocaleString()}</strong></div>
          <div>Total Credit: <strong className="text-violet-700">฿{totalCredit.toLocaleString()}</strong></div>
          <div>Grand Total: <strong className="text-green-700">฿{grandTotal.toLocaleString()}</strong></div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            ✓ Approve
          </button>
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ExpenseDetailPage({ params }: { params: Promise<{ tripCode: string }> }) {
  const { tripCode } = use(params);
  const router = useRouter();
  const trip = INIT_TRIPS.find(t => t.tripCode === tripCode);

  const [sections, setSections] = useState<ExpenseSections>(trip ? initExpSections(trip) : {
    guide: [], vehicle: [], other: [], allowance: [], extra: [],
  });
  const [showApprove, setShowApprove] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  if (!trip) {
    return (
      <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
            <div className="text-gray-400">ไม่พบ Trip Code: {tripCode}</div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleItem = (sec: SectionKey, id: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, checked: !i.checked } : i) }));

  const setActPax = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({
      ...p,
      [sec]: p[sec].map(i => {
        if (i.id !== id) return i;
        const n = Number(val);
        return { ...i, actPax: n, actCost: i.costType === "Person" ? i.costUnit * n : i.actCost };
      }),
    }));

  const setActCost = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, actCost: Number(val) } : i) }));

  const allItems    = Object.values(sections).flat().filter(i => i.checked);
  const totalCash   = allItems.filter(i => i.payment === "Cash").reduce((s, i) => s + (Number(i.actCost) || 0), 0);
  const totalCredit = allItems.filter(i => i.payment === "Credit").reduce((s, i) => s + (Number(i.actCost) || 0), 0);
  const grandTotal  = totalCash + totalCredit;

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Breadcrumb + Actions */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/payment/expenses" className="text-blue-500 hover:underline">Payment</Link>
            <span>›</span>
            <Link href="/payment/expenses" className="text-blue-500 hover:underline">Expenses</Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">{trip.tripCode}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/payment/expenses")}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => showToast("บันทึก Expense เรียบร้อย ✓")}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              💾 Save
            </button>
          </div>
        </div>

        <main className="flex-1 bg-stone-50 p-6">
          <PaxBar paxAdv={trip.paxAdv} checkedIn={trip.checkedIn} noShow={trip.noShow} />
          <ProgramInfoCard
            program={trip.program} tripRound={trip.tripRound} tripType={trip.tripType}
            option={trip.option} date={trip.date} tripCode={trip.tripCode}
          />

          {/* Main 2-column */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px", alignItems: "start" }}>
            {/* Left */}
            <div>
              <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                <div className="bg-[#1A2340] px-5 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold text-white">📋 Expense Detail</span>
                  <span className="text-xs text-gray-400">ค่าใช้จ่ายทั้งหมดแยกตาม Category</span>
                  <div className="ml-auto flex gap-2">
                    <span className="text-xs font-semibold rounded-md px-3 py-1 border border-blue-200 bg-blue-50 text-blue-700">
                      💳 Cash = จ่ายก่อน
                    </span>
                    <span className="text-xs font-semibold rounded-md px-3 py-1 border border-violet-200 bg-violet-50 text-violet-700">
                      📋 Credit = จ่ายทีหลัง
                    </span>
                  </div>
                </div>
                <ExpenseSectionsTable
                  sections={sections}
                  onToggle={toggleItem}
                  onSetActPax={setActPax}
                  onSetActCost={setActCost}
                />
              </div>
            </div>

            {/* Right: Summary */}
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">สรุป Expense</p>
                </div>

                {/* Cash breakdown */}
                <div className="px-5 py-3 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">💳 Cash Items</p>
                  {(Object.entries(sections) as [SectionKey, ExpenseSections[SectionKey]][]).map(([key, items]) => {
                    const cashTotal = items.filter(i => i.checked && i.payment === "Cash").reduce((s, i) => s + Number(i.actCost), 0);
                    if (cashTotal === 0) return null;
                    const m = SEC[key];
                    return (
                      <div key={key} className="flex justify-between mb-1.5 text-xs">
                        <span style={{ color: m.color }}>{m.icon} {m.label}</span>
                        <span className="font-semibold text-blue-700">฿{cashTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Credit breakdown */}
                <div className="px-5 py-3 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">📋 Credit Items</p>
                  {(Object.entries(sections) as [SectionKey, ExpenseSections[SectionKey]][]).map(([key, items]) => {
                    const creditTotal = items.filter(i => i.checked && i.payment === "Credit").reduce((s, i) => s + Number(i.actCost), 0);
                    if (creditTotal === 0) return null;
                    const m = SEC[key];
                    return (
                      <div key={key} className="flex justify-between mb-1.5 text-xs">
                        <span style={{ color: m.color }}>{m.icon} {m.label}</span>
                        <span className="font-semibold text-violet-700">฿{creditTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                {[
                  { label: "Total Cash",   value: totalCash,   bg: "#EFF6FF", color: "#1D4ED8" },
                  { label: "Total Credit", value: totalCredit, bg: "#F5F3FF", color: "#6D28D9" },
                  { label: "Grand Total",  value: grandTotal,  bg: "#F0FDF4", color: "#14532D" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-bold min-w-[80px] text-right"
                      style={{ background: r.bg, color: r.color }}>
                      ฿{r.value.toLocaleString()}
                    </div>
                  </div>
                ))}

                <div className="p-4 flex flex-col gap-2">
                  <button
                    onClick={() => setShowApprove(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl py-3 transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => showToast("บันทึก Expense เรียบร้อย ✓")}
                    className="w-full bg-white border border-gray-200 text-gray-600 text-sm rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    💾 Save
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
          tripCode={trip.tripCode}
          program={trip.program}
          totalCash={totalCash}
          totalCredit={totalCredit}
          grandTotal={grandTotal}
          onClose={() => setShowApprove(false)}
          onConfirm={() => { showToast("บันทึก Expense เรียบร้อย ✓"); setShowApprove(false); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
