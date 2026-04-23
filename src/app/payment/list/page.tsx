"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// ─── Summary Card Icons ────────────────────────────────────────────────────────
const IconTotalAmount = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#265ED6" />
  </svg>
);
const IconPaid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3.62166 8.49C5.59166 -0.169998 18.4217 -0.159997 20.3817 8.5C21.5317 13.58 18.3717 17.88 15.6017 20.54C13.5917 22.48 10.4117 22.48 8.39166 20.54C5.63166 17.88 2.47166 13.57 3.62166 8.49Z" stroke="#1CB579" strokeWidth={1.5} />
    <path d="M9.25 11.5L10.75 13L14.75 9" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M15.241 2H8.76101C5.00101 2 4.71101 5.38 6.74101 7.22L17.261 16.78C19.291 18.62 19.001 22 15.241 22H8.76101C5.00101 22 4.71101 18.62 6.74101 16.78L17.261 7.22C19.291 5.38 19.001 2 15.241 2Z" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconOverdue = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 7V12L15 15" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#D91616" strokeWidth={1.5} />
  </svg>
);

type PaymentStatus = "Paid" | "Pending" | "Overdue" | "Partial";

interface PaymentRecord {
  id: number;
  bookingNo: string;
  customerName: string;
  tripCode: string;
  program: string;
  travelDate: string;
  pax: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: string;
}

const statusBadge: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  Paid:    { bg: "bg-[#e6f3e6]", text: "text-[#1CB579]", label: "Paid" },
  Pending: { bg: "bg-[#fff8e1]", text: "text-[#FFA000]", label: "Pending" },
  Overdue: { bg: "bg-[#ffeaea]", text: "text-[#D91616]", label: "Overdue" },
  Partial: { bg: "bg-[#e8f0fe]", text: "text-[#265ED6]", label: "Partial" },
};

const mockPayments: PaymentRecord[] = [
  {
    id: 1,
    bookingNo: "TQC417792",
    customerName: "John Smith",
    tripCode: "EC25Z1PW",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    travelDate: "17/12/2025",
    pax: 2,
    totalAmount: 4800,
    paidAmount: 4800,
    dueDate: "10/12/2025",
    status: "Paid",
    paymentMethod: "Credit Card",
  },
  {
    id: 2,
    bookingNo: "TQC417793",
    customerName: "Sarah Johnson",
    tripCode: "EC2581C4",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    travelDate: "17/12/2025",
    pax: 3,
    totalAmount: 5400,
    paidAmount: 0,
    dueDate: "14/12/2025",
    status: "Overdue",
    paymentMethod: "-",
  },
  {
    id: 3,
    bookingNo: "TQC417794",
    customerName: "Mike Wilson",
    tripCode: "EC255D2C",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    travelDate: "17/12/2025",
    pax: 4,
    totalAmount: 8000,
    paidAmount: 4000,
    dueDate: "15/12/2025",
    status: "Partial",
    paymentMethod: "Bank Transfer",
  },
  {
    id: 4,
    bookingNo: "TQC417795",
    customerName: "Emma Davis",
    tripCode: "EC25DM35",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    travelDate: "17/12/2025",
    pax: 2,
    totalAmount: 3600,
    paidAmount: 0,
    dueDate: "17/12/2025",
    status: "Pending",
    paymentMethod: "-",
  },
  {
    id: 5,
    bookingNo: "TQC417796",
    customerName: "Robert Brown",
    tripCode: "EC25PV01",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    travelDate: "17/12/2025",
    pax: 6,
    totalAmount: 36000,
    paidAmount: 36000,
    dueDate: "12/12/2025",
    status: "Paid",
    paymentMethod: "Credit Card",
  },
  {
    id: 6,
    bookingNo: "TQC417797",
    customerName: "Lisa Anderson",
    tripCode: "EC25PV02",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    travelDate: "17/12/2025",
    pax: 4,
    totalAmount: 24000,
    paidAmount: 24000,
    dueDate: "11/12/2025",
    status: "Paid",
    paymentMethod: "Bank Transfer",
  },
  {
    id: 7,
    bookingNo: "TQC417798",
    customerName: "David Martinez",
    tripCode: "EC25Z1PW",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    travelDate: "17/12/2025",
    pax: 2,
    totalAmount: 4800,
    paidAmount: 0,
    dueDate: "16/12/2025",
    status: "Overdue",
    paymentMethod: "-",
  },
  {
    id: 8,
    bookingNo: "TQC417799",
    customerName: "Jennifer Taylor",
    tripCode: "EC2581C4",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    travelDate: "17/12/2025",
    pax: 5,
    totalAmount: 9000,
    paidAmount: 0,
    dueDate: "17/12/2025",
    status: "Pending",
    paymentMethod: "-",
  },
];

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PaymentListPage() {
  const [selectedDate, setSelectedDate] = useState("17/12/2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filteredByTab = mockPayments.filter((p) => {
    if (activeTab === "paid") return p.status === "Paid";
    if (activeTab === "pending") return p.status === "Pending" || p.status === "Partial";
    if (activeTab === "overdue") return p.status === "Overdue";
    return true;
  });

  const filtered = filteredByTab.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.bookingNo.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.tripCode.toLowerCase().includes(q) ||
      p.program.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary
  const totalAmount = mockPayments.reduce((s, p) => s + p.totalAmount, 0);
  const paidAmount = mockPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.totalAmount, 0);
  const pendingCount = mockPayments.filter((p) => p.status === "Pending" || p.status === "Partial").length;
  const overdueCount = mockPayments.filter((p) => p.status === "Overdue").length;

  const paidCount = mockPayments.filter((p) => p.status === "Paid").length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-stone-50 flex flex-col">
          <div className="w-full max-w-[1616px] mx-auto flex-1 inline-flex flex-col justify-start items-end gap-6">

            {/* Breadcrumb + Toolbar */}
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-2">
                <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Payment</span>
                <ChevronRightIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
                <span className="text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Payment List</span>
              </div>
              <div className="flex justify-end items-center gap-6">
                {/* Calendar */}
                <div className="w-80 px-3 py-2 bg-white rounded-lg border border-[#d9d9d9] inline-flex justify-start items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
                  <input
                    type="date"
                    value={selectedDate.split("/").reverse().join("-")}
                    onChange={(e) => {
                      const [y, m, d] = e.target.value.split("-");
                      setSelectedDate(`${d}/${m}/${y}`);
                    }}
                    className="flex-1 min-w-0 text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight bg-transparent border-0 outline-none"
                  />
                </div>
                {/* Search */}
                <div className="w-80 px-3 py-2 bg-white rounded-lg border border-[#d9d9d9] inline-flex justify-start items-center gap-2">
                  <MagnifyingGlassIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="Enter search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="flex-1 min-w-0 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight bg-transparent border-0 outline-none placeholder:text-[#b9b9b9]"
                  />
                </div>
                {/* Export */}
                <button
                  type="button"
                  className="px-4 py-2 bg-white rounded-lg border border-[#d9d9d9] inline-flex items-center gap-2"
                >
                  <svg className="w-6 h-6 text-[#2a2a2a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Export</span>
                  <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="w-full grid grid-cols-4 gap-6">
              {/* Total Amount */}
              <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[22px] font-normal font-['IBM_Plex_Sans_Thai'] leading-8">
                      ฿{formatAmount(totalAmount)}
                    </div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Total Amount</div>
                  </div>
                  <div className="p-2.5 bg-[#e8f0fe] rounded-xl flex justify-center items-center shrink-0">
                    <IconTotalAmount />
                  </div>
                </div>
              </div>

              {/* Paid */}
              <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{paidCount}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Paid</div>
                    <div className="text-[#1CB579] text-sm font-normal font-['IBM_Plex_Sans_Thai']">฿{formatAmount(paidAmount)}</div>
                  </div>
                  <div className="p-2.5 bg-[#e6f3e6] rounded-xl flex justify-center items-center shrink-0">
                    <IconPaid />
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{pendingCount}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Pending</div>
                  </div>
                  <div className="p-2.5 bg-[#fff8e1] rounded-xl flex justify-center items-center shrink-0">
                    <IconPending />
                  </div>
                </div>
              </div>

              {/* Overdue */}
              <div className="min-w-0 p-6 bg-white rounded-xl border border-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1a1a1a] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{overdueCount}</div>
                    <div className="text-[#1a1a1a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Overdue</div>
                  </div>
                  <div className="p-2.5 bg-[#ffeaea] rounded-xl flex justify-center items-center shrink-0">
                    <IconOverdue />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="self-stretch inline-flex justify-start items-center gap-6">
              <div className="flex-1 flex justify-start items-start gap-2">
                {(["all", "paid", "pending", "overdue"] as const).map((tab) => {
                  const labels: Record<typeof tab, string> = { all: "All", paid: "Paid", pending: "Pending", overdue: "Overdue" };
                  const counts: Record<typeof tab, number> = {
                    all: mockPayments.length,
                    paid: mockPayments.filter((p) => p.status === "Paid").length,
                    pending: mockPayments.filter((p) => p.status === "Pending" || p.status === "Partial").length,
                    overdue: mockPayments.filter((p) => p.status === "Overdue").length,
                  };
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                      className={`p-2 rounded-sm flex justify-center items-center gap-2 ${
                        activeTab === tab
                          ? "border-b-4 border-[#fe7931] text-[#265ed6]"
                          : "text-[#142b41]"
                      }`}
                    >
                      <span className="text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{labels[tab]}</span>
                      <span className="px-[7px] bg-[#265ed6] rounded-md text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                        {counts[tab]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="self-stretch overflow-x-auto rounded-xl border border-[#E7E7E9] bg-white">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f5]">
                    {["#", "Booking No.", "Customer Name", "Trip Code", "Program", "Travel Date", "Pax", "Total Amount", "Paid Amount", "Due Date", "Payment Method", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-sm font-semibold font-['IBM_Plex_Sans_Thai'] text-[#1a1a1a] whitespace-nowrap border-b border-[#E7E7E9]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center text-[#b9b9b9] font-['IBM_Plex_Sans_Thai']">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p, idx) => {
                      const badge = statusBadge[p.status];
                      return (
                        <tr key={p.id} className="border-b border-[#E7E7E9] hover:bg-[#fafafa] transition-colors">
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-[#265ED6] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {p.bookingNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {p.customerName}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {p.tripCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] max-w-[220px] truncate">
                            {p.program}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {p.travelDate}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] text-center">
                            {p.pax}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap text-right">
                            ฿{formatAmount(p.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm font-['IBM_Plex_Sans_Thai'] whitespace-nowrap text-right">
                            <span className={p.paidAmount > 0 ? "text-[#1CB579]" : "text-[#b9b9b9]"}>
                              ฿{formatAmount(p.paidAmount)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-['IBM_Plex_Sans_Thai'] whitespace-nowrap ${p.status === "Overdue" ? "text-[#D91616]" : "text-[#1a1a1a]"}`}>
                            {p.dueDate}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1a1a1a] font-['IBM_Plex_Sans_Thai'] whitespace-nowrap">
                            {p.paymentMethod}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium font-['IBM_Plex_Sans_Thai'] ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Summary row */}
                {paginated.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#f5f5f5] font-semibold">
                      <td colSpan={6} className="px-4 py-3 text-sm font-semibold font-['IBM_Plex_Sans_Thai'] text-[#1a1a1a]">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold font-['IBM_Plex_Sans_Thai'] text-[#1a1a1a] text-center">
                        {paginated.reduce((s, p) => s + p.pax, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold font-['IBM_Plex_Sans_Thai'] text-[#1a1a1a] text-right whitespace-nowrap">
                        ฿{formatAmount(paginated.reduce((s, p) => s + p.totalAmount, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold font-['IBM_Plex_Sans_Thai'] text-[#1CB579] text-right whitespace-nowrap">
                        ฿{formatAmount(paginated.reduce((s, p) => s + p.paidAmount, 0))}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination */}
            <div className="w-full h-6 flex justify-end items-center gap-6 mt-4">
              <div className="h-6 px-2 bg-white rounded border border-[#b9b9b9] flex justify-center items-center gap-1 relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="text-[#3e3939] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight bg-transparent border-0 outline-none cursor-pointer appearance-none pr-6"
                >
                  <option value={15}>15 / page</option>
                  <option value={30}>30 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-[#3e3939] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex justify-start items-start gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-6 h-6 flex items-center justify-center bg-white rounded border border-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDownIcon className="w-4 h-4 text-[#3e3939] rotate-90" />
                </button>
                <div className="flex justify-start items-start gap-2">
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[24px] h-6 px-[9px] rounded flex items-center justify-center text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] ${
                          currentPage === pageNum
                            ? "bg-[#2a4b6a] text-white"
                            : "bg-white border border-[#e1e1e1] text-[#3e3939]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-6 h-6 flex items-center justify-center bg-white rounded border border-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDownIcon className="w-4 h-4 text-[#3e3939] -rotate-90" />
                </button>
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
