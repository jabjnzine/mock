"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingNo: string;
  travelDate: string;
  tripRound: string;
  customerName: string;
  totalPax: number;
  initialCheckIn?: number;
  onConfirm: (checkInCount: number) => void;
}

export default function CheckInModal({
  isOpen,
  onClose,
  bookingNo,
  travelDate,
  tripRound,
  customerName,
  totalPax,
  initialCheckIn = 0,
  onConfirm,
}: CheckInModalProps) {
  // Default = Total Pax (เมื่อเปิดโมดัลแสดงจำนวน pax เต็ม)
  const [checkInCount, setCheckInCount] = useState(
    initialCheckIn !== undefined && initialCheckIn > 0 ? initialCheckIn : totalPax
  );

  useEffect(() => {
    if (isOpen) {
      setCheckInCount(
        initialCheckIn !== undefined && initialCheckIn > 0 ? initialCheckIn : totalPax
      );
    }
  }, [isOpen, initialCheckIn, totalPax]);

  const handleConfirm = () => {
    onConfirm(checkInCount);
    onClose();
  };

  if (!isOpen) return null;

  const travelDateFormatted = `${travelDate} : ${tripRound.replace(":", " : ")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col justify-start items-start gap-2.5 mx-4 w-full max-w-[464px]">
        <div className="w-full bg-white rounded-2xl shadow-[0px_3px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="self-stretch pt-6 pb-3 pl-12 pr-6 bg-white flex justify-center items-start gap-2.5">
            <div className="flex-1 flex flex-col justify-start items-center gap-3">
              <div className="self-stretch text-center text-[#142B41] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">
                Check-In
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-6 flex items-center justify-center overflow-hidden rounded hover:bg-gray-100 transition-colors"
              aria-label="ปิด"
            >
              <XMarkIcon className="size-5 text-[#2A2A2A]" strokeWidth={1.67} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col justify-center items-start gap-6">
            <div className="self-stretch flex justify-start items-center gap-3">
              <div className="text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                Select the number of pax you wish to check in.
              </div>
            </div>

            <div className="w-full px-6 py-3 bg-[#F8FCFF] rounded-[10px] flex flex-col justify-start items-start gap-3 overflow-hidden">
              <div className="w-full flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <div className="w-[180px] flex flex-col justify-center items-start gap-1">
                    <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      Booking No.
                    </div>
                    <div className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      {bookingNo}
                    </div>
                  </div>
                  <div className="w-[180px] flex flex-col justify-center items-start gap-1">
                    <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      Travel date / Trip Round :
                    </div>
                    <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      {travelDateFormatted}
                    </div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <div className="w-[180px] flex flex-col justify-center items-start gap-1">
                    <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      Customer
                    </div>
                    <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      {customerName}
                    </div>
                  </div>
                  <div className="w-[180px] flex flex-col justify-center items-start gap-1">
                    <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      Total Pax
                    </div>
                    <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      {totalPax} Pax
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="text-center text-[#2A2A2A] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">
                Check-In
              </div>
              <div className="w-full p-3 rounded-lg flex flex-col justify-center items-center gap-6">
                <div className="flex flex-col justify-center items-center gap-3">
                  <div className="inline-flex justify-start items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckInCount((c) => Math.max(0, c - 1))}
                      disabled={checkInCount <= 0}
                      className="size-8 p-1 rounded-full outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center disabled:opacity-50 disabled:outline-gray-300 disabled:cursor-not-allowed"
                    >
                      <MinusIcon className="size-5 text-[#265ED6] disabled:text-gray-400" />
                    </button>
                    <div className="w-20 p-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-[#B9B9B9] flex justify-center items-center">
                      <span className="text-[#2A2A2A] text-xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-8">
                        {checkInCount}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckInCount((c) => Math.min(totalPax, c + 1))}
                      disabled={checkInCount >= totalPax}
                      className={`size-8 p-1 rounded-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        checkInCount >= totalPax
                          ? "bg-[#E7E7E9]"
                          : "outline outline-1 outline-offset-[-1px] outline-[#265ED6]"
                      }`}
                    >
                      <PlusIcon
                        className={`size-5 ${checkInCount >= totalPax ? "text-gray-400" : "text-[#265ED6]"}`}
                      />
                    </button>
                  </div>
                  <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
                    / {totalPax} Pax
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="self-stretch p-6 bg-[#F8F8F8] flex justify-end items-center gap-2.5 overflow-hidden">
            <div className="flex-1 flex justify-end items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
              >
                <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Cancel
                </span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-[#1CB579] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
