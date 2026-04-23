"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TripTypeBadge from "../components/TripTypeBadge";
import { formatPaymentMoney } from "../components/payment-table-styles";
import { expenseApplyClientTripStatus } from "../lib/expense-client-state";
import type { TripStatus } from "../lib/payment-data";

type BalanceTab = "Pending" | "Completed";

type SummaryCard = {
  label: string;
  value: string;
  iconBg: string;
  icon: ReactNode;
};

type BalanceRow = {
  id: number;
  tripCode: string;
  tripType: "Join In" | "Private";
  program: string;
  guide: string;
  advPax: number;
  advance: number;
  actPax: number;
  actual: number;
  balance: number;
  status: TripStatus;
};

const completedRows: BalanceRow[] = [
  {
    id: 1,
    tripCode: "EC25A9K3",
    tripType: "Join In",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    guide: "G1",
    advPax: 20,
    advance: 23800,
    actPax: 19,
    actual: 23085,
    balance: -955,
    status: "Completed",
  },
];

const pendingRows: BalanceRow[] = [
  {
    id: 1,
    tripCode: "EC25DM35",
    tripType: "Join In",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    guide: "G2",
    advPax: 35,
    advance: 18900,
    actPax: 0,
    actual: 0,
    balance: 18900,
    status: "Pending",
  },
  {
    id: 2,
    tripCode: "EC255D2C",
    tripType: "Join In",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    guide: "G3",
    advPax: 20,
    advance: 15200,
    actPax: 0,
    actual: 0,
    balance: 15200,
    status: "Pending",
  },
  {
    id: 3,
    tripCode: "EC25PV01",
    tripType: "Private",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    guide: "G4",
    advPax: 6,
    advance: 6800,
    actPax: 0,
    actual: 0,
    balance: 6800,
    status: "Pending",
  },
  {
    id: 4,
    tripCode: "EC25PV02",
    tripType: "Private",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    guide: "G5",
    advPax: 8,
    advance: 7200,
    actPax: 0,
    actual: 0,
    balance: 7200,
    status: "Pending",
  },
  {
    id: 5,
    tripCode: "TF25Z1PW",
    tripType: "Join In",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    guide: "G6",
    advPax: 20,
    advance: 12400,
    actPax: 0,
    actual: 0,
    balance: 12400,
    status: "Pending",
  },
];

const tableHeaders = [
  { label: "#", className: "w-16 text-center bg-[#142B41]" },
  { label: "Trip Code", className: "w-[130px] text-left bg-[#142B41]" },
  { label: "Trip Type", className: "w-[104px] text-center bg-[#142B41]" },
  { label: "Program", className: "text-left bg-[#142B41]" },
  { label: "Guide", className: "w-[130px] text-left bg-[#142B41]" },
  { label: "Adv.Pax", className: "w-20 text-right bg-[#265ED6]" },
  { label: "Advance", className: "w-[110px] text-right bg-[#265ED6]" },
  { label: "Act.Pax", className: "w-20 text-right bg-[#FD5C04]" },
  { label: "Actual", className: "w-[120px] text-right bg-[#FD5C04]" },
  { label: "Balance", className: "w-[120px] text-right bg-[#1CB579]" },
  { label: "Action", className: "w-20 text-center bg-[#142B41]" },
] as const;

function CalendarIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M8 2V5M16 2V5M3.5 9H20.5M4 5.5H20C20.5523 5.5 21 5.94772 21 6.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6.5C3 5.94772 3.44772 5.5 4 5.5Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="13.5" r="0.5" fill="#292D32" />
      <circle cx="12" cy="13.5" r="0.5" fill="#292D32" />
      <circle cx="15.5" cy="13.5" r="0.5" fill="#292D32" />
      <circle cx="8.5" cy="17" r="0.5" fill="#292D32" />
      <circle cx="12" cy="17" r="0.5" fill="#292D32" />
      <circle cx="15.5" cy="17" r="0.5" fill="#292D32" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="11" cy="11" r="8" stroke="#292D32" strokeWidth="1.5" />
      <path d="M20 20L17 17" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15.5V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V15.5" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function BalancePage() {
  const [date, setDate] = useState("17/12/2025");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<BalanceTab>("Pending");

  const balanceRows = useMemo(
    () => expenseApplyClientTripStatus([...pendingRows, ...completedRows]),
    []
  );

  const pendingBalanceRows = useMemo(
    () => balanceRows.filter((row) => row.status === "Pending" || row.status === "Approved"),
    [balanceRows]
  );

  const completedBalanceRows = useMemo(
    () => balanceRows.filter((row) => row.status === "Completed"),
    [balanceRows]
  );

  const counts = useMemo(
    () => ({
      Pending: pendingBalanceRows.length,
      Completed: completedBalanceRows.length,
    }),
    [completedBalanceRows.length, pendingBalanceRows.length]
  );

  const rows = useMemo(() => {
    const source = activeTab === "Completed" ? completedBalanceRows : pendingBalanceRows;
    const keyword = search.trim().toLowerCase();

    if (!keyword) return source;

    return source.filter((row) =>
      [row.tripCode, row.program, row.guide].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [activeTab, completedBalanceRows, pendingBalanceRows, search]);

  const showSlipColumn = activeTab === "Completed";
  const visibleTableHeaders = useMemo(
    () =>
      showSlipColumn
        ? [...tableHeaders.slice(0, 10), { label: "Slip", className: "w-20 text-center bg-[#142B41]" }, tableHeaders[10]]
        : tableHeaders,
    [showSlipColumn]
  );

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const amountTrip = rows.length;
    const totalAdvance = rows.reduce((sum, row) => sum + row.advance, 0);
    const totalExpense = rows.reduce((sum, row) => sum + row.actual, 0);
    const total = rows.reduce((sum, row) => sum + row.advance + row.actual, 0);

    return [
      {
        label: "Amount Trip",
        value: String(amountTrip),
        iconBg: "bg-[#DCEEFF]",
        icon: (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#265ED6" strokeWidth="1.5" />
            <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="#265ED6" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        label: "Total Advance",
        value: formatPaymentMoney(totalAdvance),
        iconBg: "bg-[#FFF5D9]",
        icon: (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#FFC107" strokeWidth="1.5" />
            <path d="M12 7V17M9.5 9.5C9.5 8.672 10.172 8 11 8H13C13.828 8 14.5 8.672 14.5 9.5C14.5 10.328 13.828 11 13 11H11C10.172 11 9.5 11.672 9.5 12.5C9.5 13.328 10.172 14 11 14H13C13.828 14 14.5 14.672 14.5 15.5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Total Expense",
        value: formatPaymentMoney(totalExpense),
        iconBg: "bg-[#FFCAAD]",
        icon: (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#FD5C04" strokeWidth="1.5" />
            <path d="M12 7V17M9.75 9.25L12 7L14.25 9.25" stroke="#FD5C04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        label: "Total",
        value: formatPaymentMoney(total),
        iconBg: "bg-[#E6F3E6]",
        icon: (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="3" stroke="#007800" strokeWidth="1.5" />
            <path d="M14 14L21 21" stroke="#007800" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3" stroke="#007800" strokeWidth="1.5" />
          </svg>
        ),
      },
    ];
  }, [rows]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.advance += row.advance;
        acc.actual += row.actual;
        acc.balance += row.balance;
        return acc;
      },
      { advance: 0, actual: 0, balance: 0 }
    );
  }, [rows]);

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex flex-1 flex-col gap-6 bg-stone-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium leading-6 tracking-tight text-[#B9B9B9]">Expense</span>
              <span className="text-[#292D32]">›</span>
              <span className="text-lg font-semibold leading-7 tracking-tight text-[#265ED6]">Expense</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4">
              <div className="flex w-80 items-center gap-2 rounded-lg border border-[#D9D9D9] bg-white px-3 py-2">
                <CalendarIcon />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent text-base font-normal leading-6 tracking-tight text-[#2A2A2A] outline-none"
                />
              </div>

              <div className="flex w-80 items-center gap-2 rounded-lg border border-[#D9D9D9] bg-white px-3 py-2">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter search"
                  className="flex-1 bg-transparent text-base font-normal leading-6 tracking-tight text-[#2A2A2A] outline-none placeholder:text-[#B9B9B9]"
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D9D9D9] bg-white px-4 py-2 text-base font-medium leading-6 tracking-tight text-[#2A2A2A]"
              >
                <ExportIcon />
                <span>Export</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="flex min-w-0 flex-col gap-6 rounded-xl border border-[#E7E7E9] bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-[28px] font-normal leading-10 text-[#1A1A1A]">{card.value}</div>
                    <div className="text-base font-normal leading-6 text-[#1A1A1A]">{card.label}</div>
                  </div>
                  <div className={`flex shrink-0 items-center justify-center rounded-xl p-2.5 ${card.iconBg}`}>{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[
              { key: "Pending" as const, count: counts.Pending },
              { key: "Completed" as const, count: counts.Completed },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 p-2 ${
                    isActive ? "border-b-4 border-[#FE7931]" : ""
                  }`}
                >
                  <span className={`text-base font-medium leading-6 tracking-tight ${isActive ? "text-[#265ED6]" : "text-[#142B41]"}`}>
                    {tab.key}
                  </span>
                  <span className="flex items-center justify-center overflow-hidden rounded-md bg-[#265ED6] px-[7px] text-base font-medium leading-6 tracking-tight text-white">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-lg border border-[#D9D9D9] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-[130px]" />
                  <col className="w-[104px]" />
                  <col />
                  <col className="w-[130px]" />
                  <col className="w-20" />
                  <col className="w-[110px]" />
                  <col className="w-20" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  {showSlipColumn ? <col className="w-20" /> : null}
                  <col className="w-20" />
                </colgroup>
                <thead>
                  <tr>
                    {visibleTableHeaders.map((header, index) => (
                      <th
                        key={header.label}
                        className={`h-11 p-2 text-base font-medium leading-6 tracking-tight text-white ${
                          index > 0 ? "border-l border-white" : ""
                        } ${header.className}`}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${activeTab}-${row.tripCode}`} className="border-b border-[#D9D9D9] last:border-b-0">
                      <td className="h-16 bg-white p-2 text-center text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {row.id}
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2">
                        <Link href={`/payment/balance/${row.tripCode}`} className="text-base font-normal leading-6 tracking-tight text-[#265ED6] underline">
                          {row.tripCode}
                        </Link>
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-center">
                        <div className="flex justify-center">
                          <TripTypeBadge tripType={row.tripType} />
                        </div>
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        <div className="line-clamp-1">{row.program}</div>
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        <div className="line-clamp-1">{row.guide}</div>
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-right text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {row.advPax}
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-right text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {formatPaymentMoney(row.advance)}
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-right text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {row.actPax}
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-right text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {formatPaymentMoney(row.actual)}
                      </td>
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-right text-base font-normal leading-6 tracking-tight text-[#2A2A2A]">
                        {row.balance < 0 ? `-${formatPaymentMoney(Math.abs(row.balance))}` : formatPaymentMoney(row.balance)}
                      </td>
                      {showSlipColumn ? (
                        <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-center">
                          <div className="mx-auto h-8 w-8 rounded border border-[#D9D9D9] bg-white" />
                        </td>
                      ) : null}
                      <td className="h-16 border-l border-[#D9D9D9] bg-white p-2 text-center">
                        <button type="button" className="inline-flex h-6 items-center justify-center px-1.5">
                          <span className="flex gap-1">
                            <span className="h-1 w-1 rounded-full bg-[#142B41]" />
                            <span className="h-1 w-1 rounded-full bg-[#142B41]" />
                            <span className="h-1 w-1 rounded-full bg-[#142B41]" />
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="h-12 border-t border-[#D9D9D9] bg-white px-4 text-left text-base font-medium leading-6 tracking-tight text-[#265ED6]">
                      Total
                    </td>
                    <td className="h-12 border-t border-[#D9D9D9] bg-white px-2 text-right text-base font-medium leading-6 tracking-tight text-[#265ED6]">
                      {formatPaymentMoney(totals.advance)}
                    </td>
                    <td className="h-12 border-t border-[#D9D9D9] bg-white" />
                    <td className="h-12 border-t border-[#D9D9D9] bg-white px-2 text-right text-base font-medium leading-6 tracking-tight text-[#FD5C04]">
                      {formatPaymentMoney(totals.actual)}
                    </td>
                    <td className="h-12 border-t border-[#D9D9D9] bg-white px-2 text-right text-base font-medium leading-6 tracking-tight text-[#2A2A2A]">
                      {totals.balance < 0 ? `-${formatPaymentMoney(Math.abs(totals.balance))}` : formatPaymentMoney(totals.balance)}
                    </td>
                    <td colSpan={showSlipColumn ? 2 : 1} className="h-12 border-t border-[#D9D9D9] bg-white" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6">
            <button type="button" className="inline-flex h-6 items-center gap-1 rounded border border-[#B9B9B9] bg-white px-2 text-sm font-normal leading-[18px] tracking-tight text-[#3E3939]">
              15 / page
              <span className="text-[10px]">▼</span>
            </button>

            <div className="flex items-center gap-4">
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-[#3E3939]">
                ‹
              </button>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded bg-[#2A4B6A] text-sm font-normal leading-[18px] tracking-tight text-white">
                  1
                </button>
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-sm font-normal leading-[18px] tracking-tight text-[#3E3939]">
                  2
                </button>
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-sm font-normal leading-[18px] tracking-tight text-[#3E3939]">
                  ...
                </button>
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-sm font-normal leading-[18px] tracking-tight text-[#3E3939]">
                  9
                </button>
                <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-sm font-normal leading-[18px] tracking-tight text-[#3E3939]">
                  10
                </button>
              </div>
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-[#E1E1E1] bg-white text-[#3E3939]">
                ›
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
