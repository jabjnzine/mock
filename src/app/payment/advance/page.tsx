"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { INIT_TRIPS, calcAdvTotal, calcExtraAdvTotal, Trip } from "../lib/payment-data";

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

// ─── ACTION DROPDOWN ──────────────────────────────────────────────────────────
function ActionMenu({ tripCode, onApprove }: { tripCode: string; onApprove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg transition-colors"
      >
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-[#E7E7E9] z-20 min-w-[160px] overflow-hidden">
            <Link
              href={`/payment/advance/${tripCode}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              ✏️ Edit Advance
            </Link>
            <button
              onClick={() => { onApprove(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              ✓ Approve
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TRIP TYPE BADGE ──────────────────────────────────────────────────────────
const TRIP_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Join In": { bg: "#EEF2FF", color: "#4338CA" },
  "Private": { bg: "#FFF7ED", color: "#C05621" },
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdvanceListPage() {
  const [trips, setTrips] = useState(INIT_TRIPS);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">("Pending");
  const [search, setSearch] = useState("");
  const [date, setDate]     = useState("17/03/2026");

  const pending   = trips.filter(t => t.status === "Pending");
  const completed = trips.filter(t => t.status === "Approved" || t.status === "Completed");
  const source    = activeTab === "Pending" ? pending : completed;

  const shown = source.filter(t =>
    t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
    t.program.toLowerCase().includes(search.toLowerCase()) ||
    t.guide.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdv      = trips.reduce((s, t) => s + calcAdvTotal(t), 0);
  const totalExtraAdv = trips.reduce((s, t) => s + calcExtraAdvTotal(t), 0);
  const grandTotal    = totalAdv + totalExtraAdv;
  const shownTotal    = shown.reduce((s, t) => s + calcAdvTotal(t), 0);

  const handleApprove = (id: number) => {
    setTrips(ts => ts.map(t => t.id === id ? { ...t, status: "Approved" as const } : t));
  };

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">Expense</span>
            <span>›</span>
            <span className="font-semibold text-gray-800">Advance</span>
          </div>

          {/* Summary Cards */}
          <div className="w-full grid grid-cols-4 gap-6">
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{trips.length}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Amount Trip</div>
                  </div>
                  <div className="p-2.5 bg-[#ffcaad] rounded-xl flex justify-center items-center shrink-0">
                    <IconAmountTrip />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{totalAdv.toLocaleString()}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Advance</div>
                  </div>
                  <div className="p-2.5 bg-[#dbeafe] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalAdvance />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{totalExtraAdv.toLocaleString()}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Extra Advance</div>
                  </div>
                  <div className="p-2.5 bg-[#fff1ca] rounded-xl flex justify-center items-center shrink-0">
                    <IconExtraAdvance />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{grandTotal.toLocaleString()}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total</div>
                  </div>
                  <div className="p-2.5 bg-[#e6f3e6] rounded-xl flex justify-center items-center shrink-0">
                    <IconGrandTotal />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">

            {/* Filter Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E7E7E9]">
              {/* Date Picker */}
              <div className="flex items-center gap-2 border border-[#E7E7E9] rounded-xl px-3 py-2 text-sm text-gray-700 bg-white">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="text"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="outline-none w-24 text-sm"
                />
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 border border-[#E7E7E9] rounded-xl px-3 py-2 text-sm text-gray-400 bg-white flex-1 max-w-xs">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Enter search"
                  className="outline-none flex-1 text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex-1" />
              {/* Export */}
              <button className="flex items-center gap-2 border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Export
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E7E7E9] px-5">
              {(["Pending", "Completed"] as const).map(tab => {
                const cnt = tab === "Pending" ? pending.length : completed.length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === tab
                        ? "border-[#FD5C04] text-[#FD5C04]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activeTab === tab
                        ? "bg-[#FD5C04] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {cnt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#1e2a3a] text-white">
                    {["#", "Trip Code", "Travel Date", "Trip Type", "Trip Round", "Program", "Registration", "Pax", "Advance", "Action"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-xs font-semibold whitespace-nowrap ${
                          h === "Advance" ? "text-[#60ADFF] font-bold" : "text-gray-300"
                        } ${i === 0 ? "w-10" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-400">ไม่พบข้อมูล</td>
                    </tr>
                  )}
                  {shown.map((t: Trip, i: number) => {
                    const adv = calcAdvTotal(t);
                    const typeStyle = TRIP_TYPE_STYLE[t.tripType] ?? { bg: "#F0F4FA", color: "#4A5573" };
                    return (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link href={`/payment/advance/${t.tripCode}`} className="text-blue-500 font-semibold hover:underline">
                            {t.tripCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.date}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ background: typeStyle.bg, color: typeStyle.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: typeStyle.color }} />
                            {t.tripType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.tripRound}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">{t.program}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">{t.vehicle}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className="text-blue-500 font-medium">{t.checkedIn}</span>
                          <span className="text-gray-400">/{t.paxAdv}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {adv.toLocaleString()}.00
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu
                            tripCode={t.tripCode}
                            onApprove={() => handleApprove(t.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {shown.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                      <td colSpan={8} className="px-4 py-3 font-bold text-gray-700 text-sm">Total</td>
                      <td className="px-4 py-3 font-bold text-blue-700 text-sm whitespace-nowrap">
                        {shownTotal.toLocaleString()}.00
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E7E7E9]">
              <div className="text-sm text-gray-400">
                แสดง {shown.length} รายการ
              </div>
              <div className="flex items-center gap-2">
                <select className="border border-[#E7E7E9] rounded-lg px-2 py-1.5 text-xs text-gray-600 outline-none">
                  <option>15 / page</option>
                  <option>30 / page</option>
                </select>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-lg border border-[#E7E7E9] flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">‹</button>
                  <button className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">1</button>
                  <button className="w-8 h-8 rounded-lg border border-[#E7E7E9] flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">›</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
