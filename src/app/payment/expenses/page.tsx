"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { INIT_TRIPS, initExpSections, calcActTotal, calcAdvTotal, Trip } from "../lib/payment-data";
import {
  expenseApplyClientTripStatus,
  expenseClearCompletedTabFlag,
  expenseReadInitialCompletedTab,
  expenseResolveActTotal,
} from "../lib/expense-client-state";
import TripTypeBadge from "../components/TripTypeBadge";
import { PAYMENT_BANK_COLOR, formatPaymentMoney } from "../components/payment-table-styles";

const IconAmountTrip = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M2 19.5V7.625C2 6.133 2.593 4.702 3.648 3.648C4.702 2.593 6.133 2 7.625 2H16.375C17.114 2 17.845 2.145 18.528 2.428C19.21 2.711 19.83 3.125 20.353 3.648C20.875 4.17 21.289 4.79 21.572 5.472C21.855 6.155 22 6.886 22 7.625V16.375C22 17.114 21.855 17.845 21.572 18.528C21.289 19.21 20.875 19.83 20.353 20.353C19.83 20.875 19.21 21.289 18.528 21.572C17.845 21.855 17.114 22 16.375 22H4.5C3.837 22 3.201 21.737 2.732 21.268C2.263 20.799 2 20.163 2 19.5Z" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12H11.375C12.038 12 12.674 12.263 13.143 12.732C13.612 13.201 13.875 13.837 13.875 14.5C13.875 15.163 13.612 15.799 13.143 16.268C12.674 16.737 12.038 17 11.375 17H7V8.25C7 7.918 7.132 7.601 7.366 7.366C7.601 7.132 7.918 7 8.25 7H10.125C10.788 7 11.424 7.263 11.893 7.732C12.362 8.201 12.625 8.837 12.625 9.5C12.625 10.163 12.362 10.799 11.893 11.268C11.424 11.737 10.788 12 10.125 12H8.25M17 17H17.012" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTotalAdvance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="2" y="5.5" width="20" height="13" rx="2" stroke="#1D4ED8" strokeWidth={1.5} />
    <path d="M2 8.5H22" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" />
    <path d="M6 16.5H8M11 16.5H13" stroke="#1D4ED8" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);
const IconTotalExpense = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#D97706" strokeWidth={1.5} />
    <path d="M12 6V8M12 16V18" stroke="#D97706" strokeWidth={1.5} strokeLinecap="round" />
    <path d="M8.5 9.5C8.5 8.119 9.619 7 11 7H12.5C13.881 7 15 8.119 15 9.5C15 10.881 13.881 12 12.5 12H11.5C10.119 12 9 13.119 9 14.5C9 15.881 10.119 17 11.5 17H13C14.381 17 15.5 15.881 15.5 14.5" stroke="#D97706" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);
const IconGrandTotal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M19 7H5C3.895 7 3 7.895 3 9V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V9C21 7.895 20.105 7 19 7Z" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7V6C16 4.895 15.105 4 14 4H10C8.895 4 8 4.895 8 6V7" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 14C15 14.796 14.084 15.572 12.714 15.857C11.344 16.143 9.742 15.857 9.742 14.571C9.742 13.286 11.344 13 12.714 13.286C14.084 13.571 15 14.347 15 15.143C15 15.938 13.884 16.714 12.5 17C11.116 17.286 9.5 17 9.5 15.714" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

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
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActionView() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M1 12s4.5-7 11-7 11 7 11 7-4.5 7-11 7-11-7-11-7Z"
        stroke="#2a2a2a"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#2a2a2a" strokeWidth={1.5} />
    </svg>
  );
}

function IconActionApprove() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#292d32" strokeWidth={1.5} />
      <path d="M8 12l2.5 3L16 9" stroke="#292d32" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconActionPrint() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-4a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2h-2"
        stroke="#2a2a2a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 14h12v8H6v-8Z" stroke="#2a2a2a" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M9 18h6" stroke="#2a2a2a" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function ExpenseRowActionMenu({
  tripCode,
  tab,
  showApprove,
  onApprove,
}: {
  tripCode: string;
  tab: "Pending" | "Completed";
  showApprove: boolean;
  onApprove: () => void;
}) {
  const [open, setOpen] = useState(false);

  const rowBase =
    "w-[164px] px-3 py-2 bg-white inline-flex justify-start items-center gap-2 text-left font-['IBM_Plex_Sans_Thai'] text-[#2a2a2a] text-base font-normal leading-6 tracking-tight hover:bg-[#f5f7fa] transition-colors";
  const close = () => setOpen(false);

  return (
    <div className="relative inline-flex justify-center">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        ···
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={close} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 top-9 z-20 w-[164px] rounded shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] inline-flex flex-col justify-start items-start overflow-hidden bg-white"
          >
            <Link
              href={`/payment/expenses/${tripCode}`}
              className={rowBase}
              role="menuitem"
              onClick={close}
            >
              <IconActionView />
              <span className="flex-1">View</span>
            </Link>
            {tab === "Pending" && showApprove ? (
              <button
                type="button"
                role="menuitem"
                className={rowBase}
                onClick={() => {
                  onApprove();
                  close();
                }}
              >
                <IconActionApprove />
                <span className="flex-1">Approve</span>
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className={rowBase}
              onClick={() => {
                window.print();
                close();
              }}
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

const BANK_COLOR = PAYMENT_BANK_COLOR;
const formatMoney = formatPaymentMoney;

export default function ExpensesListPage() {
  const [trips, setTrips] = useState(() => expenseApplyClientTripStatus(INIT_TRIPS));
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">(() =>
    expenseReadInitialCompletedTab() ? "Completed" : "Pending"
  );
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("17/12/2025");
  const [pendingSelectedIds, setPendingSelectedIds] = useState<Set<number>>(() => new Set());
  const pendingSelectAllRef = useRef<HTMLInputElement>(null);

  const pending   = trips.filter(t => t.status === "Pending" || t.status === "Approved");
  const completed = trips.filter(t => t.status === "Completed");
  const source    = activeTab === "Pending" ? pending : completed;

  const tableHeaders = [
    "#",
    "Trip Code",
    "Trip Type",
    "Program",
    "Guide",
    "Book Bank",
    "Pax",
    "Advance",
    "Expense",
    "Action",
  ] as const;

  const shown = source.filter(t =>
    t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
    t.program.toLowerCase().includes(search.toLowerCase()) ||
    t.guide.toLowerCase().includes(search.toLowerCase())
  );
  const shownPendingIds = shown.map(t => t.id);
  const allShownPendingSelected =
    shownPendingIds.length > 0 && shownPendingIds.every(id => pendingSelectedIds.has(id));
  const someShownPendingSelected = shownPendingIds.some(id => pendingSelectedIds.has(id));

  const shownTotal = shown.reduce((s, t) => s + expenseResolveActTotal(t, calcActTotal(t)), 0);
  const shownAdvanceTotal = shown.reduce((s, t) => s + calcAdvTotal(t), 0);
  const shownGrandTotal = shownAdvanceTotal + shownTotal;

  const handleApprove = (id: number) => {
    setTrips(ts => ts.map(t => t.id === id ? { ...t, status: "Completed" as const } : t));
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
    if (pendingSelectedIds.size === 0) return;
    setTrips(ts =>
      ts.map(t => (pendingSelectedIds.has(t.id) ? { ...t, status: "Completed" as const } : t)),
    );
    setPendingSelectedIds(new Set());
  };

  useEffect(() => {
    setTrips(expenseApplyClientTripStatus(INIT_TRIPS));
  }, []);

  useEffect(() => {
    if (activeTab !== "Pending") return;
    const pendingIdSet = new Set(pending.map(t => t.id));
    setPendingSelectedIds(prev => {
      let changed = false;
      const next = new Set<number>();
      prev.forEach(id => {
        if (pendingIdSet.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [pending, activeTab]);

  useEffect(() => {
    if (activeTab === "Completed") setPendingSelectedIds(new Set());
  }, [activeTab]);

  useEffect(() => {
    expenseClearCompletedTabFlag();
  }, []);

  useEffect(() => {
    const el = pendingSelectAllRef.current;
    if (!el) return;
    el.indeterminate = someShownPendingSelected && !allShownPendingSelected;
  }, [someShownPendingSelected, allShownPendingSelected]);

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-6 items-stretch">
          <div className="w-full flex flex-col justify-start items-stretch gap-6">
            <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#B9B9B9] text-base font-medium">Expense</span>
              <span className="text-[#2A2A2A]">›</span>
              <span className="text-[#265ED6] text-lg font-semibold">Expense</span>
            </div>
            <div className="inline-flex items-center gap-6">
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

          <div className="self-stretch grid grid-cols-4 gap-6">
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{shown.length}</div>
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
                    <div className="text-[#265ED6] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(shownAdvanceTotal)}</div>
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
                    <div className="text-[#FD5C04] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(shownTotal)}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Expense</div>
                  </div>
                  <div className="p-2.5 bg-[#FFCAAD] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalExpense />
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1CB579] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{formatMoney(shownGrandTotal)}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total</div>
                  </div>
                  <div className="p-2.5 bg-[#e6f3e6] rounded-xl flex justify-center items-center shrink-0">
                    <IconGrandTotal />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-transparent">
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

          <div className="self-stretch bg-white rounded-lg border border-[#D9D9D9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border-collapse">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-[130px]" />
                  <col className="w-[104px]" />
                  <col />
                  <col className="w-[200px]" />
                  <col className="w-[200px]" />
                  <col className="w-[68px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-20" />
                </colgroup>
                <thead>
                  <tr className="bg-[#142B41] text-white h-11">
                    {tableHeaders.map((h, i) => (
                      <th
                        key={`${h}-${i}`}
                        className={`p-2 h-11 text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap ${
                          i > 0 ? "border-l border-white" : ""
                        } ${h === "Advance" ? "bg-[#265ED6]" : ""} ${h === "Expense" ? "bg-[#FD5C04]" : ""} ${
                          h === "#" || h === "Trip Type" || h === "Action"
                            ? "text-center"
                            : h === "Pax" || h === "Advance" || h === "Expense"
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                          {h === "#" && activeTab === "Pending" ? (
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
                    const exp = expenseResolveActTotal(t, calcActTotal(t));
                    const adv = calcAdvTotal(t);
                    const bankColor = BANK_COLOR[t.bankName] ?? "#265ED6";
                    return (
                      <tr key={t.id} className={`h-16 border-b border-[#D9D9D9] ${i % 2 === 1 ? "bg-[#F8F8F8]" : "bg-white"}`}>
                        <td className="p-2 h-16 border-[#D9D9D9]">
                          <div className="flex h-full items-center justify-center gap-2">
                            {activeTab === "Pending" ? (
                              <input
                                type="checkbox"
                                checked={pendingSelectedIds.has(t.id)}
                                onChange={() => togglePendingRowSelected(t.id)}
                                className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#D9D9D9] accent-[#265ED6]"
                                aria-label={`เลือก ${t.tripCode}`}
                              />
                            ) : null}
                            <span className="text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight tabular-nums">
                              {i + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 h-16 border-l border-[#D9D9D9]">
                          <Link href={`/payment/expenses/${t.tripCode}`} className="text-[#265ED6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6 tracking-tight">
                            {t.tripCode}
                          </Link>
                        </td>
                        <td className="p-2 h-16 border-l border-[#D9D9D9]">
                          <TripTypeBadge tripType={t.tripType} />
                        </td>
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
                        <td className="p-2 h-16 border-l border-[#D9D9D9] text-right text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap">
                          {formatMoney(exp)}
                        </td>
                        <td className="p-2 h-16 border-l border-[#D9D9D9] text-center">
                          <ExpenseRowActionMenu
                            tripCode={t.tripCode}
                            tab={activeTab}
                            showApprove={activeTab === "Pending"}
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
                      <td colSpan={7} className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Total</td>
                      <td className="px-4 py-3 text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight text-right whitespace-nowrap">
                        {formatMoney(shownAdvanceTotal)}
                      </td>
                      <td className="px-4 py-3 text-[#FD5C04] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight text-right whitespace-nowrap">
                        {formatMoney(shownTotal)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="self-stretch flex items-center justify-end gap-6">
            <button type="button" className="h-6 px-2 bg-white rounded border border-[#B9B9B9] inline-flex items-center gap-1 text-sm text-[#3E3939]">
              15 / page <span className="text-[10px]">▼</span>
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939]">‹</button>
              <button type="button" className="w-6 h-6 rounded bg-[#2A4B6A] text-white text-sm">1</button>
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">2</button>
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">…</button>
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">9</button>
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939] text-sm">10</button>
              <button type="button" className="w-6 h-6 rounded border border-[#E1E1E1] text-[#3E3939]">›</button>
            </div>
          </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
