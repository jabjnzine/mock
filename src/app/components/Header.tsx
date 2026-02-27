"use client";

import { useState, useEffect } from "react";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const FONT = "'IBM Plex Sans Thai', sans-serif";

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentDateTime(`${day}. ${date} ${month}. ${year} : ${hours}:${minutes}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="w-full h-16 bg-white overflow-hidden flex items-center justify-end pr-6 shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]"
    >
      <div className="inline-flex justify-end items-center gap-4 overflow-hidden">
        {/* วันที่และเวลา */}
        <div
          className="text-stone-500 text-base font-normal leading-6 tracking-tight"
          style={{ fontFamily: FONT }}
        >
          {currentDateTime}
        </div>

        {/* การแจ้งเตือน */}
        <button
          type="button"
          className="relative size-6 flex items-center justify-center text-slate-800 hover:opacity-80 transition-opacity"
          aria-label="การแจ้งเตือน"
        >
          <BellIcon className="size-5" strokeWidth={1.5} />
          <span className="absolute -top-2 -right-2 min-w-5 h-4 px-1 flex items-center justify-center bg-red-600 rounded-[33px] text-white text-xs font-medium leading-4" style={{ fontFamily: FONT }}>
            99+
          </span>
        </button>

        {/* เส้นแบ่งแนวตั้ง */}
        <div className="w-px h-6 bg-zinc-300 shrink-0" />

        {/* ผู้ใช้ + อวาตาร์ + ลูกศร */}
        <div className="flex justify-start items-center gap-2">
          <div className="size-12 rounded-full overflow-hidden bg-zinc-200 shrink-0 flex items-center justify-center">
            <img
              src="/avatar.png"
              alt="Martin"
              className="size-12 rounded-full object-cover"
            />
          </div>
          <div className="inline-flex flex-col justify-start items-start">
            <div
              className="text-slate-800 text-lg font-semibold leading-7 tracking-tight"
              style={{ fontFamily: FONT }}
            >
              Martin
            </div>
            <div
              className="text-cyan-900 text-sm font-normal leading-4 tracking-tight"
              style={{ fontFamily: FONT }}
            >
              Super Admin
            </div>
          </div>
          <div className="size-6 flex items-center justify-center text-slate-800 shrink-0">
            <ChevronDownIcon className="size-5" strokeWidth={2} />
          </div>
        </div>
      </div>
    </header>
  );
}
