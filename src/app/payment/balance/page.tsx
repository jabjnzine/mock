"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { INIT_TRIPS, Trip, calcAdvTotal, calcActTotal } from "../lib/payment-data";

const TRIP_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Join In": { bg: "#EEF2FF", color: "#4338CA" },
  "Private":  { bg: "#FFF7ED", color: "#C05621" },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IconTotalTrips = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M2 19.5V7.625C2 6.73 2.73 6 3.625 6H8V4.5C8 3.672 8.672 3 9.5 3H14.5C15.328 3 16 3.672 16 4.5V6H20.375C21.27 6 22 6.73 22 7.625V19.5C22 20.328 21.328 21 20.5 21H3.5C2.672 21 2 20.328 2 19.5Z" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12H11.375M12.625 12H17M12 8.5V15.5" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTotalAdvance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1D4ED8" strokeWidth={1.5} />
    <path d="M12 6V8M12 16V18" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" />
    <path d="M8.5 9.5C8.5 8.119 9.619 7 11 7H12.5C13.881 7 15 8.119 15 9.5C15 10.881 13.881 12 12.5 12H11.5C10.119 12 9 13.119 9 14.5C9 15.881 10.119 17 11.5 17H13C14.381 17 15.5 15.881 15.5 14.5" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const IconTotalExpense = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M19 7H5C3.895 7 3 7.895 3 9V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V9C21 7.895 20.105 7 19 7Z" stroke="#059669" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7V6C16 4.895 15.105 4 14 4H10C8.895 4 8 4.895 8 6V7" stroke="#059669" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12H15M9 16H12" stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const IconNetBalance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" stroke="#7C3AED" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V21M3 8.5L21 8.5" stroke="#7C3AED" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── CLOSE ACCOUNT MODAL ─────────────────────────────────────────────────────
function ConfirmModal({ trip, bal, onClose, onConfirm }: {
  trip: Trip; bal: number; onClose: () => void; onConfirm: () => void;
}) {
  const [slips, setSlips] = useState<boolean[]>([]);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-7 w-[520px] max-w-[95vw] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">ยืนยันปิดบัญชี</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="text-sm text-gray-600 space-y-1.5 leading-relaxed mb-4">
          <div>Trip: <strong>{trip.tripCode}</strong></div>
          <div>Bank: <strong>{trip.bankNo} ({trip.bankName})</strong></div>
          <div className={`mt-3 p-3 rounded-lg font-semibold text-sm ${
            bal < 0 ? "bg-red-50 text-red-700" : bal > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
          }`}>
            {bal < 0
              ? `⬆️ จ่ายเพิ่มให้ Guide ฿${Math.abs(bal).toLocaleString()}`
              : bal > 0
                ? `⬇️ เก็บคืนจาก Guide ฿${bal.toLocaleString()}`
                : "✅ ยอดพอดี"
            }
          </div>
        </div>

        {/* Slip Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-4">
          <div className="text-2xl mb-1">📎</div>
          <p className="text-sm text-gray-400 mb-3">Upload Transfer Slip</p>
          <div className="flex justify-center gap-3">
            {slips.map((_, i) => (
              <div key={i} className="relative w-14 h-14 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-xl">
                🖼️
                <button onClick={() => setSlips(ss => ss.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ×
                </button>
              </div>
            ))}
            {slips.length < 3 && (
              <button onClick={() => setSlips(ss => [...ss, true])}
                className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-2xl text-gray-300 hover:border-gray-400 hover:text-gray-400">
                +
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            ✓ ปิดบัญชี
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
export default function BalancePage() {
  const trips = INIT_TRIPS;
  const [closed, setClosed] = useState<Record<number, boolean>>({ 3: true });
  const [confirmModal, setConfirmModal] = useState<{ trip: Trip; bal: number } | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const totalAdv = trips.reduce((s, t) => s + calcAdvTotal(t), 0);
  const totalExp = trips.reduce((s, t) => s + calcActTotal(t), 0);
  const netBal   = totalAdv - totalExp;

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-800">Payment</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Balance</span>
          </div>

          {/* Summary Cards */}
          <div className="w-full grid grid-cols-4 gap-6">
            {/* Total Trips */}
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{trips.length}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Trips</div>
                  </div>
                  <div className="p-2.5 bg-[#ffcaad] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalTrips />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Advance */}
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">฿{totalAdv.toLocaleString()}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Advance</div>
                  </div>
                  <div className="p-2.5 bg-[#dbeafe] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalAdvance />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Expense */}
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">฿{totalExp.toLocaleString()}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Expense</div>
                  </div>
                  <div className="p-2.5 bg-[#e6f3e6] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalExpense />
                  </div>
                </div>
              </div>
            </div>

            {/* Net Balance */}
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className={`text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10 ${
                      netBal > 0 ? "text-green-700" : netBal < 0 ? "text-red-700" : "text-[#1a1a1a]"
                    }`}>
                      {netBal >= 0 ? "+" : ""}฿{Math.abs(netBal).toLocaleString()}
                    </div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Net Balance</div>
                  </div>
                  <div className="p-2.5 bg-[#ede9fe] rounded-xl flex justify-center items-center shrink-0">
                    <IconNetBalance />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["Trip Code", "ประเภท", "Program", "Round", "Guide", "Pax", "Advance", "Expense", "Balance", "สถานะ", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-[#E7E7E9] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t, i) => {
                    const adv = calcAdvTotal(t);
                    const exp = calcActTotal(t);
                    const bal = adv - exp;
                    const isClosed = !!closed[t.id];
                    const typeStyle = TRIP_TYPE_STYLE[t.tripType] ?? { bg: "#F0F4FA", color: "#4A5573" };
                    return (
                      <tr key={t.id} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-4 py-3 text-blue-500 font-semibold">{t.tripCode}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{ background: typeStyle.bg, color: typeStyle.color }}>
                            {t.tripType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[160px]">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">{t.program}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-600 rounded-md px-2 py-0.5 text-xs font-semibold">
                            ⏰ {t.tripRound}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{t.guide}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{t.checkedIn}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold">฿{adv.toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-700">฿{exp.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-lg px-3 py-1 text-sm font-bold whitespace-nowrap"
                            style={{
                              background: bal > 0 ? "#DCFCE7" : bal < 0 ? "#FEE2E2" : "#F1F5F9",
                              color: bal > 0 ? "#14532D" : bal < 0 ? "#991B1B" : "#475569",
                            }}
                          >
                            {bal > 0 ? "+" : ""}{bal === 0 ? "฿0" : `฿${Math.abs(bal).toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isClosed ? (
                            <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                              ✓ ปิดแล้ว
                            </span>
                          ) : (
                            <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                              รอปิด
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!isClosed && (
                            <button
                              onClick={() => setConfirmModal({ trip: t, bal })}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {confirmModal && (
        <ConfirmModal
          trip={confirmModal.trip}
          bal={confirmModal.bal}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => {
            setClosed(c => ({ ...c, [confirmModal.trip.id]: true }));
            setConfirmModal(null);
            showToast("ปิดบัญชีเรียบร้อย ✓");
          }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
