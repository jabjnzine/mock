"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";
import { QrCodeIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Squares2X2Icon } from "@heroicons/react/24/solid";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingDetails from "../../components/BookingDetails";

const EXAMPLE_BOOKING_CODE = "TQC417792";

const EXAMPLE_RECORDS = [
  { code: "TQC417792", time: "09:30 AM", persons: 2 },
  { code: "TQC417792-02", time: "09:30 AM", persons: 2 },
];

// กรอก TS0001 = Booking ที่เคย Split แล้ว → เลือกได้ว่าจะ Check In รายการไหน (Original TS0001, รายการเพิ่ม TS0001-1)
const TS0001_ORIGINAL_BOOKING = "TS0001";
const TS0001_RECORDS = [
  { code: "TS0001", time: "07:30 AM", persons: 5 },
  { code: "TS0001-1", time: "07:30 AM", persons: 5 },
];

const STORAGE_KEY_CHECKED_IN = "excursionCheckedInBookingCodes";

function getCheckedInBookingCodes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_CHECKED_IN);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function clearCheckedInBookingCodes(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_CHECKED_IN);
  } catch {}
}

function isExampleCode(input: string): boolean {
  const normalized = input.trim().replace(/\s/g, "").toUpperCase();
  return normalized === EXAMPLE_BOOKING_CODE || normalized.includes(EXAMPLE_BOOKING_CODE);
}

function isTS0001Code(input: string): boolean {
  const normalized = input.trim().replace(/\s/g, "").toUpperCase();
  return normalized === "TS0001";
}

export default function CheckInExcursionPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [showTS0001Modal, setShowTS0001Modal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ts0001CheckedInCodes, setTs0001CheckedInCodes] = useState<string[]>([]);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // อัปเดตรายการที่ Check In ไปแล้วเมื่อเปิด modal TS0001 หรือเมื่อ mount (กลับมาหน้า Check In)
  useEffect(() => {
    if (!mounted) return;
    setTs0001CheckedInCodes(getCheckedInBookingCodes());
  }, [mounted, showTS0001Modal]);

  const openBookingDrawer = (code: string) => {
    setDrawerBookingId(code);
    setShowBookingDrawer(true);
    // ให้ animation เริ่มหลังจาก mount แล้ว
    setTimeout(() => setDrawerOpen(true), 0);
  };

  const closeBookingDrawer = () => {
    // เล่น animation ปิดก่อน
    setDrawerOpen(false);
    setTimeout(() => {
      setShowBookingDrawer(false);
      setDrawerBookingId(null);
    }, 300); // ต้องตรงกับ duration ของ transition
  };

  const addCheckedInCode = (code: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_CHECKED_IN);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(code)) {
        const updated = [...list, code];
        sessionStorage.setItem(STORAGE_KEY_CHECKED_IN, JSON.stringify(updated));
        setTs0001CheckedInCodes(updated);
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleCheckIn = () => {
    const id = bookingId.trim();
    if (!id) return;
    if (isExampleCode(id)) {
      setShowExampleModal(true);
      return;
    }
    if (isTS0001Code(id)) {
      setShowTS0001Modal(true);
      return;
    }
    // สำหรับ booking อื่น ๆ ให้เปิดหน้า View Booking แบบ Drawer
    openBookingDrawer(id);
  };

  const handleProceedToView = (bookingCode: string) => {
    setShowExampleModal(false);
    setShowTS0001Modal(false);
    openBookingDrawer(bookingCode);
  };

  const handleClearCheckedInList = () => {
    clearCheckedInBookingCodes();
    setTs0001CheckedInCodes([]);
  };

  const handleScan = () => {
    // เดโม่: เมื่อกดสแกน ให้กรอกหมายเลข Booking ตัวอย่าง TS0001 ลงในช่องให้เลย (ไม่แจ้งเตือน)
    const demoCode = "TS0001";
    setBookingId(demoCode);

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
        <main className="flex-1 overflow-auto p-6 bg-stone-50">
          <div className="w-full max-w-[1616px] mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai',sans-serif] leading-6 tracking-tight">
              Check In
            </span>
            <ChevronRightIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
            <span className="text-[#b9b9b9] text-base font-medium font-['IBM_Plex_Sans_Thai',sans-serif] leading-6 tracking-tight">
              Excursion
            </span>
            <ChevronRightIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
            <span className="text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai',sans-serif] leading-7 tracking-tight">
              Check In
            </span>
          </div>

          <div className="w-full max-w-[1616px] mx-auto mt-0 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
            <div className="w-full max-w-[774px] flex flex-col items-center gap-8 px-4">
              {/* รูปภาพ Check In illustration */}
              <div className="w-full max-w-[600px] flex-shrink-0">
                <img
                  src="/assets/Check_in.png"
                  alt="Check In"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Form Section — ตรงตาม Figma: label สีดำ, input ขอบเทาอ่อน, ไอคอนขอบน้ำเงิน, ปุ่มน้ำเงินทึบ */}
              <div className="w-full max-w-[500px] flex flex-col items-center gap-4">
                <div className="w-full flex flex-col gap-2">
                  <label className="text-slate-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai',sans-serif] leading-7 tracking-tight">
                    Check In
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
                        input: "text-base font-['IBM_Plex_Sans_Thai',sans-serif] text-slate-800 placeholder:text-zinc-400",
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
                  className="w-full min-h-11 px-6 py-2.5 bg-blue-700 rounded-lg text-white text-base font-medium font-['IBM_Plex_Sans_Thai',sans-serif] leading-6 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  Check In
                </button>
              </div>
            </div>
          </div>
    </div>
    </main>
        <Footer />
      </div>

      {/* Drawer: View Booking */}
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
              {/* Drawer Header — แถบบนเต็มความกว้าง */}
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

              {/* Drawer Body — เต็มจอ เลื่อนได้ */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="w-full max-w-[1568px] mx-auto p-6">
                  <BookingDetails
                    bookingId={drawerBookingId}
                    onCancel={closeBookingDrawer}
                    onCheckIn={() => {
                      addCheckedInCode(drawerBookingId);
                      closeBookingDrawer();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal ตัวอย่าง: เมื่อพิมพ์ TQC417792 - ใช้ Portal เพื่อให้อยู่เหนือทุกชั้น */}
      {mounted &&
        showExampleModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
          <div className="w-full max-w-[930px] max-h-[90vh] overflow-auto relative">
            <div className="bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="w-full pl-12 pr-6 pt-6 pb-3 bg-white flex justify-center items-start gap-2.5">
                <div className="flex-1 flex flex-col justify-start items-center gap-3">
                  <div className="w-full text-center text-slate-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Select a Booking to Check In
                  </div>
                  <div className="w-52 h-0.5 border-b-4 border-blue-300 rounded" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowExampleModal(false)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-zinc-800"
                  aria-label="ปิด"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="w-full p-6 flex flex-col justify-start items-start gap-6">
                {/* QR Code Scanned */}
                <div className="w-full bg-slate-50 rounded-lg flex flex-col gap-6">
                  <div className="w-full p-6 flex flex-col justify-center items-center gap-6">
                    <div className="w-full flex justify-start items-start gap-2">
                      <div className="w-8 h-8 p-1 bg-blue-100 rounded-full flex justify-center items-center shrink-0">
                        <Squares2X2Icon className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-start gap-0.5">
                        <div className="w-full text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          QR Code Scanned
                        </div>
                        <div className="w-full text-zinc-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                          Found 2 booking records associated with this code
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-end items-end gap-0.5">
                        <div className="w-full text-right text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          TQC417792
                        </div>
                        <div className="w-full text-right text-zinc-500 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                          Original Booking
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of records */}
                <div className="w-full flex flex-col gap-2">
                  {EXAMPLE_RECORDS.map((record) => (
                    <div
                      key={record.code}
                      className="w-full bg-white rounded-lg border border-zinc-300 flex flex-col gap-6"
                    >
                      <div className="w-full p-6 flex flex-col justify-center items-center gap-6">
                        <div className="w-full min-h-20 flex justify-between items-center gap-4 flex-wrap">
                          <div className="flex flex-col justify-start items-start gap-1 min-w-0">
                            <div className="text-zinc-400 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                              Selected Record
                            </div>
                            <div className="justify-start text-gray-900 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                              {record.code}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                              <span className="text-blue-600 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">
                                {record.time} • {record.persons} Pax
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-end items-center gap-4 shrink-0">
                            <Button
                              onPress={() => handleProceedToView(record.code)}
                              className="min-h-10 px-5 py-2 bg-blue-700 rounded-full text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                              endContent={<ChevronRightIcon className="w-5 h-5 text-white" />}
                            >
                              Proceed to Check-In
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="w-full p-6 bg-stone-50 flex flex-col justify-center items-end gap-2.5">
                <div className="flex justify-end items-center gap-4">
                  <Button
                    variant="bordered"
                    onPress={() => setShowExampleModal(false)}
                    className="min-h-10 px-5 py-2 bg-white rounded-full border border-blue-700 text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
            {/* Decorative corner */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-14 h-14 overflow-hidden pointer-events-none">
              <div className="w-11 h-12 bg-red-600 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-sm" />
            </div>
          </div>
        </div>,
          document.body
        )}

      {/* Modal เมื่อกรอก TS0001 (Booking ที่เคย Split) — Select a Booking to Check In */}
      {mounted &&
        showTS0001Modal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
            <div className="w-full max-w-[930px] max-h-[90vh] overflow-auto relative">
              <div className="bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="w-full pl-12 pr-6 pt-6 pb-3 bg-white inline-flex justify-center items-start gap-2.5">
                  <div className="flex-1 inline-flex flex-col justify-start items-center gap-3">
                    <div className="self-stretch text-center text-slate-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                      Select a Booking to Check In
                    </div>
                    <div className="w-52 h-0.5 border-b-4 border-blue-300 rounded" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTS0001Modal(false)}
                    className="size-6 flex items-center justify-center rounded hover:bg-gray-100 text-zinc-800"
                    aria-label="ปิด"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="w-full p-6 flex flex-col justify-start items-start gap-6">
                  {/* QR Code Scanned */}
                  <div className="w-full bg-slate-50 rounded-lg flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch p-6 flex flex-col justify-center items-center gap-6">
                      <div className="self-stretch inline-flex justify-start items-start gap-2">
                        <div className="size-8 p-1 bg-blue-100 rounded-full flex justify-center items-center shrink-0">
                          <Squares2X2Icon className="size-5 text-blue-700" />
                        </div>
                        <div className="flex-1 inline-flex flex-col justify-center items-start gap-2">
                          <div className="self-stretch text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            QR Code Scanned
                          </div>
                          <div className="self-stretch text-zinc-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                            Found 2 booking records associated with this code
                          </div>
                        </div>
                        <div className="flex-1 inline-flex flex-col justify-start items-end gap-0.5">
                          <div className="self-stretch text-right text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            {TS0001_ORIGINAL_BOOKING}
                          </div>
                          <div className="self-stretch text-right text-zinc-500 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                            Original Booking
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List of records (Split Booking) — รายการที่ Check In ไปแล้วจะปุ่ม Disable */}
                  <div className="self-stretch flex flex-col gap-2">
                    {TS0001_RECORDS.map((record) => {
                      const alreadyCheckedIn = ts0001CheckedInCodes.includes(record.code);
                      return (
                        <div
                          key={record.code}
                          className="w-full bg-white rounded-lg border border-zinc-300 flex flex-col justify-start items-start gap-6"
                        >
                          <div className="self-stretch p-6 flex flex-col justify-center items-center gap-6">
                            <div className="self-stretch min-h-20 inline-flex justify-between items-center gap-4">
                              <div className="w-36 min-h-20 inline-flex flex-col justify-start items-start gap-1">
                                <div className="text-zinc-400 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">
                                  Selected Record
                                </div>
                                <div className="text-gray-900 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                                  {record.code}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="size-2 bg-blue-600 rounded-full shrink-0" />
                                  <span className="text-blue-600 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">
                                    {record.time} • {record.persons} Pax
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-end items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => !alreadyCheckedIn && handleProceedToView(record.code)}
                                  disabled={alreadyCheckedIn}
                                  className="px-5 py-2 rounded-full flex justify-center items-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:border disabled:border-zinc-400 bg-blue-700 hover:opacity-90"
                                >
                                  <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                    Proceed to Check-In
                                  </span>
                                  <ChevronRightIcon className="size-6 text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="self-stretch p-6 bg-stone-50 flex flex-col justify-center items-end gap-2.5 overflow-hidden">
                  <div className="inline-flex justify-end items-center gap-4">
                    {ts0001CheckedInCodes.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearCheckedInList}
                        className="px-5 py-2 text-zinc-600 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-6 hover:text-zinc-800 underline transition-colors"
                      >
                        ล้างรายการที่ Check In แล้ว
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowTS0001Modal(false)}
                      className="px-5 py-2 bg-white rounded-full border border-blue-700 flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                        Cancel
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
