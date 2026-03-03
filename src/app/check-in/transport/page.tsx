"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/react";
import { QrCodeIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingDetails from "../../components/BookingDetails";

const TRANSPORT_CHECK_IN_CODE = "TFtest-01";
const STORAGE_KEY_CHECKED_IN = "transportCheckedInBookingCodes";

function getCheckedInBookingCodes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_CHECKED_IN);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isTransportCheckInCode(input: string): boolean {
  const normalized = input.trim().replace(/\s/g, "");
  return normalized.toLowerCase() === TRANSPORT_CHECK_IN_CODE.toLowerCase();
}

/**
 * TM_CheckIn — Transport > Check In
 * หน้า Check In สำหรับ Transport (กรอก/สแกน Booking ID)
 * ใช้ TFtest-01 เป็นตัวเปิด View Booking แบบ Drawer
 */
export default function TransportCheckInPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const openBookingDrawer = (code: string) => {
    setDrawerBookingId(code);
    setShowBookingDrawer(true);
    setTimeout(() => setDrawerOpen(true), 0);
  };

  const closeBookingDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setShowBookingDrawer(false);
      setDrawerBookingId(null);
    }, 300);
  };

  const addCheckedInCode = (code: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_CHECKED_IN);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(code)) {
        sessionStorage.setItem(STORAGE_KEY_CHECKED_IN, JSON.stringify([...list, code]));
      }
    } catch {}
  };

  const handleCheckIn = () => {
    const id = bookingId.trim();
    if (!id) return;
    if (isTransportCheckInCode(id)) {
      openBookingDrawer(id);
      return;
    }
    router.push(`/check-in/transport/list`);
  };

  const handleScan = () => {
    setBookingId(TRANSPORT_CHECK_IN_CODE);
    const input = document.querySelector<HTMLInputElement>('input[name="booking-id"]');
    if (input) {
      input.focus();
      input.select();
    }
  };

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Check In
            </span>
            <ChevronRightIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
            <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Transport
            </span>
            <ChevronRightIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
            <span className="text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
              Check In
            </span>
          </div>

          <div className="w-full max-w-[1616px] mx-auto bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
            <div className="w-full max-w-[774px] flex flex-col items-center gap-8 px-4">
              {/* รูปภาพ Check In illustration — ใช้รูปเดียวกับ Excursion */}
              <div className="w-full max-w-[600px] flex-shrink-0">
                <img
                  src="/assets/Check_in.png"
                  alt="Check In"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="w-full max-w-[500px] flex flex-col items-center gap-4">
                <div className="w-full flex flex-col gap-2">
                  <label className="text-slate-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Check In (Transport)
                  </label>
                  <div className="w-full flex gap-3 items-stretch">
                    <Input
                      name="booking-id"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCheckIn();
                        }
                      }}
                      placeholder="Enter Booking ID"
                      classNames={{
                        base: "flex-1",
                        input: "text-base font-['IBM_Plex_Sans_Thai'] text-slate-800 placeholder:text-zinc-400",
                        inputWrapper:
                          "w-full h-12 px-3 py-2 bg-white rounded-lg border border-zinc-300 shadow-none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleScan}
                      className="size-12 shrink-0 p-2 rounded-lg border-2 border-blue-700 flex justify-center items-center text-blue-700 hover:bg-blue-50 transition-colors"
                      title="สแกน Booking ID"
                    >
                      <QrCodeIcon className="size-6" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={!bookingId.trim()}
                  className="w-full min-h-11 px-6 py-2.5 bg-blue-700 rounded-lg text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  Check In
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Drawer: View Booking (เมื่อกรอก TFtest-01) */}
      {mounted &&
        showBookingDrawer &&
        drawerBookingId &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9998] flex bg-black/40 transition-opacity duration-300 ${
              drawerOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`fixed inset-0 bg-stone-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
                drawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    Check in
                  </span>
                  <ChevronRightIcon className="size-5 text-[#b9b9b9]" />
                  <span className="text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    View Booking
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeBookingDrawer}
                  className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-zinc-800 border border-gray-200"
                  aria-label="ปิด"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="w-full max-w-[1568px] mx-auto p-6">
                  <BookingDetails
                    bookingId={drawerBookingId}
                    onCancel={closeBookingDrawer}
                    onCheckIn={() => {
                      addCheckedInCode(drawerBookingId!);
                      closeBookingDrawer();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
