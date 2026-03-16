"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { INIT_TRIPS, calcAdvTotal, calcActTotal } from "../lib/payment-data";

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
export default function ReportPage() {
  const trips = INIT_TRIPS;
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const totalAdv = trips.reduce((s, t) => s + calcAdvTotal(t), 0);
  const totalExp = trips.reduce((s, t) => s + calcActTotal(t), 0);

  const summaryStats = [
    { label: "Trips ทั้งหมด",  value: String(trips.length)                    },
    { label: "Total Advance",  value: `฿${totalAdv.toLocaleString()}`          },
    { label: "Total Expense",  value: `฿${totalExp.toLocaleString()}`          },
    { label: "Pending",        value: String(trips.filter(t => t.status === "Pending").length)   },
    { label: "Approved",       value: String(trips.filter(t => t.status === "Approved").length)  },
    { label: "Completed",      value: String(trips.filter(t => t.status === "Completed").length) },
  ];

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
            <span className="text-blue-600 font-semibold">Report</span>
          </div>

          {/* Report Card */}
          <div className="bg-white rounded-xl border border-[#E7E7E9] p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-800">📊 Payment Report Summary</h2>
              <button
                onClick={() => showToast("Export สำเร็จ ✓")}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                ↑ Export to Excel
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {summaryStats.map(c => (
                <div key={c.label} className="bg-gray-50 rounded-xl p-4 border border-[#E7E7E9]">
                  <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
              ))}
            </div>

            {/* Trip Detail Table */}
            <div className="border border-[#E7E7E9] rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-[#E7E7E9]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">รายละเอียดรายการ</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["#", "Trip Code", "Program", "Date", "Guide", "Pax", "Advance", "Expense", "Balance", "Status"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-200 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((t, i) => {
                      const adv = calcAdvTotal(t);
                      const exp = calcActTotal(t);
                      const bal = adv - exp;
                      const statusColors: Record<string, { bg: string; color: string }> = {
                        Pending:   { bg: "#FEF9C3", color: "#854D0E" },
                        Approved:  { bg: "#DBEAFE", color: "#1E40AF" },
                        Completed: { bg: "#DCFCE7", color: "#14532D" },
                      };
                      const st = statusColors[t.status] ?? { bg: "#F1F5F9", color: "#475569" };
                      return (
                        <tr key={t.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 text-blue-500 font-semibold">{t.tripCode}</td>
                          <td className="px-4 py-3 text-gray-700 max-w-[180px]">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">{t.program}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{t.date}</td>
                          <td className="px-4 py-3 text-gray-700">{t.guide}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{t.checkedIn}</td>
                          <td className="px-4 py-3 text-blue-700 font-semibold">฿{adv.toLocaleString()}</td>
                          <td className="px-4 py-3 text-green-700">฿{exp.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span
                              className="rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap"
                              style={{
                                background: bal > 0 ? "#DCFCE7" : bal < 0 ? "#FEE2E2" : "#F1F5F9",
                                color: bal > 0 ? "#14532D" : bal < 0 ? "#991B1B" : "#475569",
                              }}
                            >
                              {bal > 0 ? "+" : ""}{bal === 0 ? "฿0" : `฿${Math.abs(bal).toLocaleString()}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-md px-2 py-0.5 text-xs font-medium"
                              style={{ background: st.bg, color: st.color }}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={6} className="px-4 py-3 font-bold text-gray-700 text-sm">รวม</td>
                      <td className="px-4 py-3 font-bold text-blue-700 text-sm">฿{totalAdv.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-green-700 text-sm">฿{totalExp.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-sm" style={{
                        color: (totalAdv - totalExp) >= 0 ? "#14532D" : "#991B1B",
                      }}>
                        {(totalAdv - totalExp) >= 0 ? "+" : ""}฿{Math.abs(totalAdv - totalExp).toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
