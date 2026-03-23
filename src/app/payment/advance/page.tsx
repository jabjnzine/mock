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
    <div className="relative inline-flex">
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

// ─── TRIP TYPE BADGE (อิงจาก Check-in list) ─────────────────────────────────
const JoinInTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M7.63411 9.05866C7.55078 9.05033 7.45078 9.05033 7.35911 9.05866C5.37578 8.99199 3.80078 7.36699 3.80078 5.36699C3.80078 3.32533 5.45078 1.66699 7.50078 1.66699C9.54245 1.66699 11.2008 3.32533 11.2008 5.36699C11.1924 7.36699 9.61745 8.99199 7.63411 9.05866Z" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.6747 3.33301C15.2914 3.33301 16.5914 4.64134 16.5914 6.24967C16.5914 7.82467 15.3414 9.10801 13.7831 9.16634C13.7164 9.15801 13.6414 9.15801 13.5664 9.16634" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.46563 12.133C1.44896 13.483 1.44896 15.683 3.46563 17.0247C5.75729 18.558 9.51563 18.558 11.8073 17.0247C13.824 15.6747 13.824 13.4747 11.8073 12.133C9.52396 10.608 5.76562 10.608 3.46563 12.133Z" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.2852 16.667C15.8852 16.542 16.4518 16.3003 16.9185 15.942C18.2185 14.967 18.2185 13.3587 16.9185 12.3837C16.4602 12.0337 15.9018 11.8003 15.3102 11.667" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrivateTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12.1586 10.87C12.0586 10.86 11.9386 10.86 11.8286 10.87C9.44859 10.79 7.55859 8.84 7.55859 6.44C7.55859 3.99 9.53859 2 11.9986 2C14.4486 2 16.4386 3.99 16.4386 6.44C16.4286 8.84 14.5386 10.79 12.1586 10.87Z" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.0008 21.8097C10.1808 21.8097 8.37078 21.3497 6.99078 20.4297C4.57078 18.8097 4.57078 16.1697 6.99078 14.5597C9.74078 12.7197 14.2508 12.7197 17.0008 14.5597" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function TripTypeBadge({ tripType }: { tripType: string }) {
  if (/private/i.test(tripType)) {
    return (
      <div className="px-2 py-1 rounded-[30px] inline-flex items-center justify-center gap-1 bg-[#FFFBEB] border border-[#FFC107]">
        <PrivateTypeIcon />
        <span className="text-center text-sm font-normal text-[#FFC107] font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
          Private
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#F8FCFF] rounded-[30px] border border-[#265ED6]">
      <JoinInTypeIcon />
      <span className="w-12 text-center text-[#265ED6] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
        Join In
      </span>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
type SlipInfo = { preview: boolean; extraCount?: number };

const ROW_SLIPS: Record<string, SlipInfo> = {
  EC26HXDU: { preview: false },
  EC26QGZI: { preview: false },
  EC26XF0V: { preview: true },
  EC26RXD0: { preview: true, extraCount: 2 },
  EC26GOSD: { preview: false },
};

const BANK_COLOR: Record<string, string> = {
  "ธ.กสิกรไทย": "#2BB673",
  "ธ.ไทยพาณิชย์": "#553C9A",
};

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdvanceListPage() {
  const [trips, setTrips] = useState(INIT_TRIPS);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">("Pending");
  const [search, setSearch] = useState("");
  const [date, setDate]     = useState("17/03/2026");

  const pending   = trips;
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

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-6 items-end">
          {/* Header + Controls */}
          <div className="w-full inline-flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#B9B9B9] text-base font-medium">Expense</span>
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
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#D9D9D9] text-[#2A2A2A]">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V15" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M17 8L12 3L7 8M12 3V15" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-medium">Export</span>
                <span className="text-sm">▼</span>
              </button>
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

          {/* Tabs */}
          <div className="w-full flex border-b border-transparent">
            {(["Pending", "Completed"] as const).map(tab => {
              const cnt = tab === "Pending" ? pending.length : completed.length;
              return (
                <button
                  key={tab}
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

          {/* Table Card */}
          <div className="w-full bg-white rounded-lg border border-[#D9D9D9] overflow-hidden">

            {/* Table */}
            <div className="overflow-hidden">
              <table className="w-full table-fixed border-collapse">
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
                  <col className="w-20" />
                </colgroup>
                <thead>
                  <tr className="bg-[#142B41] text-white h-11">
                    {["#", "Trip Code", "Travel Date", "Trip Type", "Trip Round", "Program", "Guide", "Book Bank", "Pax", "Advance", "Slip", "Action"].map((h, i) => (
                      <th
                        key={h}
                        className={`p-2 h-11 text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap ${
                          i > 0 ? "border-l border-white" : ""
                        } ${h === "Advance" ? "bg-[#265ED6]" : ""} ${
                          h === "#" || h === "Trip Type" || h === "Slip" || h === "Action"
                            ? "text-center"
                            : h === "Pax" || h === "Advance"
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-gray-400">ไม่พบข้อมูล</td>
                    </tr>
                  )}
                  {shown.map((t: Trip, i: number) => {
                    const adv = calcAdvTotal(t);
                    const slip = ROW_SLIPS[t.tripCode] ?? { preview: false };
                    const bankColor = BANK_COLOR[t.bankName] ?? "#265ED6";
                    return (
                      <tr key={t.id} className={`h-16 border-b border-[#D9D9D9] ${i % 2 === 1 ? "bg-[#F8F8F8]" : "bg-white"}`}>
                        <td className="p-2 h-16 text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{i + 1}</td>
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
                        <td className="p-2 h-16 border-l border-[#D9D9D9]">
                          {!slip.preview ? (
                            <div className="w-8 h-8 rounded border border-[#D9D9D9] bg-white mx-auto" />
                          ) : (
                            <div className="w-8 h-8 rounded border border-[#D9D9D9] bg-[#ECECEC] relative mx-auto">
                              {slip.extraCount ? (
                                <span className="absolute inset-0 bg-black/45 text-white text-sm font-semibold flex items-center justify-center">
                                  +{slip.extraCount}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="p-2 h-16 border-l border-[#D9D9D9] text-center">
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
                    <tr className="h-12 border-t border-[#D9D9D9] bg-white">
                      <td colSpan={9} className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Total</td>
                      <td className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight text-right whitespace-nowrap">
                        {formatMoney(shownTotal)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

          </div>

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
    </div>
  );
}
