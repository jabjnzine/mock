"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../../../components/Sidebar";
import TripTable, { type Trip } from "../../../components/TripTable";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

// ─── Summary Card Icons (SVG จาก Figma) ─────────────────────────────────────
const IconWaiting = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M15.241 2H8.76101C5.00101 2 4.71101 5.38 6.74101 7.22L17.261 16.78C19.291 18.62 19.001 22 15.241 22H8.76101C5.00101 22 4.71101 18.62 6.74101 16.78L17.261 7.22C19.291 5.38 19.001 2 15.241 2Z" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCompleted = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3.62166 8.49C5.59166 -0.169998 18.4217 -0.159997 20.3817 8.5C21.5317 13.58 18.3717 17.88 15.6017 20.54C13.5917 22.48 10.4117 22.48 8.39166 20.54C5.63166 17.88 2.47166 13.57 3.62166 8.49Z" stroke="#1CB579" strokeWidth={1.5} />
    <path d="M9.25 11.5L10.75 13L14.75 9" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconNoShow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M18.4098 18.0898L15.5898 20.9098" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.4098 20.9098L15.5898 18.0898" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.1586 10.87C12.0586 10.86 11.9386 10.86 11.8286 10.87C9.44859 10.79 7.55859 8.84 7.55859 6.44C7.55859 3.99 9.53859 2 11.9986 2C14.4486 2 16.4386 3.99 16.4386 6.44C16.4286 8.84 14.5386 10.79 12.1586 10.87Z" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.0008 21.8097C10.1808 21.8097 8.37078 21.3497 6.99078 20.4297C4.57078 18.8097 4.57078 16.1697 6.99078 14.5597C9.74078 12.7197 14.2508 12.7197 17.0008 14.5597" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAmountTrip = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M2 19.5V7.625C2 6.13316 2.59263 4.70242 3.64752 3.64752C4.70242 2.59263 6.13316 2 7.625 2H16.375C17.1137 2 17.8451 2.14549 18.5276 2.42818C19.21 2.71086 19.8301 3.12519 20.3525 3.64752C20.8748 4.16985 21.2891 4.78995 21.5718 5.47241C21.8545 6.15486 22 6.88631 22 7.625V16.375C22 17.1137 21.8545 17.8451 21.5718 18.5276C21.2891 19.21 20.8748 19.8301 20.3525 20.3525C19.8301 20.8748 19.21 21.2891 18.5276 21.5718C17.8451 21.8545 17.1137 22 16.375 22H4.5C3.83696 22 3.20107 21.7366 2.73223 21.2678C2.26339 20.7989 2 20.163 2 19.5Z" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12H11.375C12.038 12 12.6739 12.2634 13.1428 12.7322C13.6116 13.2011 13.875 13.837 13.875 14.5C13.875 15.163 13.6116 15.7989 13.1428 16.2678C12.6739 16.7366 12.038 17 11.375 17H7V8.25C7 7.91848 7.1317 7.60054 7.36612 7.36612C7.60054 7.1317 7.91848 7 8.25 7H10.125C10.788 7 11.4239 7.26339 11.8928 7.73223C12.3616 8.20107 12.625 8.83696 12.625 9.5C12.625 10.163 12.3616 10.7989 11.8928 11.2678C11.4239 11.7366 10.788 12 10.125 12H8.25M17 17H17.0125" stroke="#FD5C04" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAmountPax = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M9.15859 10.87C9.05859 10.86 8.93859 10.86 8.82859 10.87C6.44859 10.79 4.55859 8.84 4.55859 6.44C4.55859 3.99 6.53859 2 8.99859 2C11.4486 2 13.4386 3.99 13.4386 6.44C13.4286 8.84 11.5386 10.79 9.15859 10.87Z" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.4112 4C18.3512 4 19.9112 5.57 19.9112 7.5C19.9112 9.39 18.4113 10.93 16.5413 11C16.4613 10.99 16.3713 10.99 16.2812 11" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.15875 14.56C1.73875 16.18 1.73875 18.82 4.15875 20.43C6.90875 22.27 11.4188 22.27 14.1688 20.43C16.5888 18.81 16.5888 16.17 14.1688 14.56C11.4288 12.73 6.91875 12.73 4.15875 14.56Z" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface TripData {
  id: number;
  tripCode: string;
  travelDate: string;
  tripType: string;
  tripRound: string;
  program: string;
  registration: string;
  personnel: string;
  guide: string;
  pax: number;
  waiting: number;
  checkedIn: number;
  noShow: number;
  hasAlert?: boolean;
}

export default function CheckInListPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("17/12/2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Mock data
  const pendingTrips: TripData[] = [
    {
      id: 1,
      tripCode: "EC25Z1PW",
      travelDate: "17/12/2025",
      tripType: "Join In",
      tripRound: "07 : 30",
      program: "Phuket : Maya Bay, Phi Phi...",
      registration: "Speed Catamaran",
      personnel: "Capt. Trunk",
      guide: "G. Peter (094-4313995)",
      pax: 20,
      waiting: 5,
      checkedIn: 8,
      noShow: 7,
    },
    {
      id: 2,
      tripCode: "EC2581C4",
      travelDate: "17/12/2025",
      tripType: "Join In",
      tripRound: "07 : 30",
      program: "Damnoen + Buffalo Cafe + Maek...",
      registration: "BUS(39) กข-1001",
      personnel: "Somchai Prasert",
      guide: "G.Jannie (080-2093565), N/A",
      pax: 39,
      waiting: 0,
      checkedIn: 38,
      noShow: 1,
      hasAlert: true,
    },
    {
      id: 3,
      tripCode: "EC255D2C",
      travelDate: "17/12/2025",
      tripType: "Join In",
      tripRound: "00 : 00",
      program: "Bangkok: Grand Palace, Wat ...",
      registration: "Guide Only (20)",
      personnel: "-",
      guide: "Guide Tom 068-4313887",
      pax: 20,
      waiting: 10,
      checkedIn: 10,
      noShow: 0,
    },
  ];

  const completedTrips: TripData[] = [
    {
      id: 4,
      tripCode: "EC25ABC1",
      travelDate: "16/12/2025",
      tripType: "Join In",
      tripRound: "08:00",
      program: "Completed Trip Example",
      registration: "BUS(20)",
      personnel: "Driver Name",
      guide: "-",
      pax: 20,
      waiting: 0,
      checkedIn: 20,
      noShow: 0,
    },
  ];

  const trips = activeTab === "pending" ? pendingTrips : completedTrips;

  // Summary calculations
  const totalWaiting = trips.reduce((sum, trip) => sum + trip.waiting, 0);
  const totalCheckedIn = trips.reduce((sum, trip) => sum + trip.checkedIn, 0);
  const totalNoShow = trips.reduce((sum, trip) => sum + trip.noShow, 0);
  const totalTrips = trips.length;
  const totalPax = trips.reduce((sum, trip) => sum + trip.pax, 0);

  // Pagination
  const totalPages = Math.ceil(trips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = trips.slice(startIndex, endIndex);

  const handleView = (tripCode: string) => {
    router.push(`/check-in/excursion/view/${encodeURIComponent(tripCode)}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Area — ขนาด/สไตล์ให้ตรงกับหน้า Excursion > Check In */}
        <main className="flex-1 overflow-y-auto p-6 bg-stone-50 flex flex-col">
          <div className="w-full max-w-[1616px] mx-auto flex-1">
            {/* Breadcrumbs — ใช้ขนาดและสีเดียวกับหน้า Check In */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-zinc-400 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                Check In
              </span>
              <span className="text-zinc-800">/</span>
              <span className="text-zinc-400 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                Excursion
              </span>
              <span className="text-zinc-800">/</span>
              <span className="text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                Check In List
              </span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate.split("/").reverse().join("-")}
                    onChange={(e) => {
                      const date = e.target.value.split("-").reverse().join("/");
                      setSelectedDate(date);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    classNames={{
                      base: "w-64",
                      input: "text-sm",
                      inputWrapper:
                        "bg-white border-gray-300 h-10",
                    }}
                    startContent={
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    }
                  />
                </div>
              </div>

              {/* Export Button */}
              <Button
                variant="bordered"
                className="border-blue-600 text-blue-600"
                endContent={<ChevronDownIcon className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>

            {/* Summary Cards - แถวเดียว พอดีความกว้าง */}
            <div className="w-full grid grid-cols-5 gap-6 mb-6">
              {/* Waiting */}
              <div data-property-1="Active" className="min-w-0 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-start items-start gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1A1A1A] text-[28px] font-normal leading-10">{totalWaiting}</div>
                      <div className="text-[#1A1A1A] text-base font-normal leading-6">Waiting</div>
                    </div>
                    <div className="p-2.5 bg-[#FFF2CA] rounded-xl flex justify-center items-center shrink-0">
                      <IconWaiting />
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed (สำเร็จ) */}
              <div data-property-1="Active" className="min-w-0 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-start items-start gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1A1A1A] text-[28px] font-normal leading-10">{totalCheckedIn}</div>
                      <div className="text-[#1A1A1A] text-base font-normal leading-6">Completed</div>
                    </div>
                    <div className="p-2.5 bg-[#E6F3E6] rounded-xl flex justify-center items-center shrink-0">
                      <IconCompleted />
                    </div>
                  </div>
                </div>
              </div>

              {/* No show */}
              <div data-property-1="Active" className="min-w-0 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-start items-start gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1A1A1A] text-[28px] font-normal leading-10">{totalNoShow}</div>
                      <div className="text-[#1A1A1A] text-base font-normal leading-6">No show</div>
                    </div>
                    <div className="p-2.5 bg-[#FFC3C3] rounded-xl flex justify-center items-center shrink-0">
                      <IconNoShow />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Trip */}
              <div data-property-1="Active" className="min-w-0 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-start items-start gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1A1A1A] text-[28px] font-normal leading-10">{totalTrips}</div>
                      <div className="text-[#1A1A1A] text-base font-normal leading-6">Amount Trip</div>
                    </div>
                    <div className="p-2.5 bg-[#FFCAAD] rounded-xl flex justify-center items-center shrink-0">
                      <IconAmountTrip />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Pax */}
              <div data-property-1="Active" className="min-w-0 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-[#E7E7E9] flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-start items-start gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                      <div className="text-[#1A1A1A] text-[28px] font-normal leading-10">{totalPax}</div>
                      <div className="text-[#1A1A1A] text-base font-normal leading-6">Amount Pax</div>
                    </div>
                    <div className="p-2.5 bg-[#E6F3E6] rounded-xl flex justify-center items-center shrink-0">
                      <IconAmountPax />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("pending");
                  setCurrentPage(1);
                }}
                className={`pb-3 px-2 relative ${
                  activeTab === "pending"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
              >
                Pending
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {pendingTrips.length}
                </span>
                {activeTab === "pending" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("completed");
                  setCurrentPage(1);
                }}
                className={`pb-3 px-2 relative ${
                  activeTab === "completed"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
              >
                Completed
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {completedTrips.length}
                </span>
                {activeTab === "completed" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>

            {/* ตารางทริป (Body + Summary) — ใช้ TripTable, เลื่อนแนวนอนได้ */}
            <div className="self-stretch overflow-x-auto">
              <TripTable
                trips={paginatedTrips.map((t): Trip => ({
                  id: t.id,
                  code: t.tripCode,
                  date: t.travelDate,
                  type: t.tripType,
                  round: t.tripRound,
                  program: t.program,
                  registration: t.registration,
                  personnel: t.personnel,
                  guide: t.guide,
                  pax: t.pax,
                  waiting: t.waiting,
                  checkedIn: t.checkedIn,
                  noShow: t.noShow,
                  hasAlert: t.hasAlert ?? false,
                }))}
                totals={{
                  pax: totalPax,
                  waiting: totalWaiting,
                  checkedIn: totalCheckedIn,
                  noShow: totalNoShow,
                }}
                onTripClick={handleView}
              />
            </div>

            <div className="mt-4">

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">/ page</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronDownIcon className="w-5 h-5 rotate-90" />
                  </button>

                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 10) {
                      pageNum = i + 1;
                    } else if (currentPage <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 4) {
                      pageNum = totalPages - 9 + i;
                    } else {
                      pageNum = currentPage - 5 + i;
                    }

                    if (
                      (i === 0 && currentPage > 5) ||
                      (i === 9 && currentPage < totalPages - 4)
                    ) {
                      return (
                        <span key={i} className="px-2 text-gray-600">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
