"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/react";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * TM_CheckIn — Transport > Check In
 * หน้า Check In สำหรับ Transport (กรอก/สแกน Booking ID)
 */
export default function TransportCheckInPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");

  const handleCheckIn = () => {
    const id = bookingId.trim();
    if (!id) return;
    // TODO: นำทางไปหน้า View Booking ของ Transport เมื่อมี route
    router.push(`/check-in/transport/list`);
  };

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-zinc-400 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Check In
            </span>
            <span className="text-zinc-800">/</span>
            <span className="text-zinc-400 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Transport
            </span>
            <span className="text-zinc-800">/</span>
            <span className="text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
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
                      onClick={() => document.querySelector<HTMLInputElement>('input[name="booking-id"]')?.focus()}
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
    </div>
  );
}
