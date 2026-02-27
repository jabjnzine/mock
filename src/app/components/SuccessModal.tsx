"use client";

import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        data-pop-up-type="Success"
        className="w-[258px] p-8 bg-white rounded-2xl shadow-[-1px_3px_4px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col justify-center items-center gap-6"
      >
        <div className="flex flex-col justify-center items-center gap-4">
          {/* Icon_Success - SVG จาก Figma */}
          <div
            data-property-1="Icon_Success"
            className="w-[124px] h-[110px] relative overflow-hidden flex items-center justify-center shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={124} height={110} viewBox="0 0 124 110" fill="none" className="shrink-0">
              <path d="M108.53 59.5898H62.8103C59.226 59.5898 56.3203 62.4933 56.3203 66.0748C56.3203 69.6564 59.226 72.5598 62.8103 72.5598H108.53C112.115 72.5598 115.02 69.6564 115.02 66.0748C115.02 62.4933 112.115 59.5898 108.53 59.5898Z" fill="#E4F3F1" />
              <path d="M86.4405 72.5703H40.7205C37.1361 72.5703 34.2305 75.4737 34.2305 79.0553C34.2305 82.6369 37.1361 85.5403 40.7205 85.5403H86.4405C90.0248 85.5403 92.9305 82.6369 92.9305 79.0553C92.9305 75.4737 90.0248 72.5703 86.4405 72.5703Z" fill="#E4F3F1" />
              <path d="M61.6202 46.6201H15.9002C12.3158 46.6201 9.41016 49.5236 9.41016 53.1051C9.41016 56.6867 12.3158 59.5901 15.9002 59.5901H61.6202C65.2045 59.5901 68.1102 56.6867 68.1102 53.1051C68.1102 49.5236 65.2045 46.6201 61.6202 46.6201Z" fill="#E4F3F1" />
              <path d="M64.2992 98.6004C87.1362 98.6004 105.649 80.0874 105.649 57.2504C105.649 34.4134 87.1362 15.9004 64.2992 15.9004C41.4622 15.9004 22.9492 34.4134 22.9492 57.2504C22.9492 80.0874 41.4622 98.6004 64.2992 98.6004Z" stroke="#1BB57A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M74.6504 44.3499C74.6604 40.6599 77.6604 37.6699 81.3504 37.6699C85.0404 37.6699 88.0404 40.6599 88.0504 44.3499" stroke="#1BB57A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M48 44.3499C48.01 40.6599 51.01 37.6699 54.7 37.6699C58.39 37.6699 61.39 40.6599 61.4 44.3499" stroke="#1BB57A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M74.8102 64.3301C74.8002 68.0201 71.8002 71.0101 68.1102 71.0101C64.4202 71.0101 61.4202 68.0201 61.4102 64.3301" stroke="#1BB57A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21.8496 23.1301L24.7496 26.0201L31.1496 19.6201" stroke="#1BB57A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M106.51 35.7401L109.41 38.3201L115.81 32.6201" stroke="#1BB57A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M100.2 18.4402C102.464 18.4402 104.3 16.6046 104.3 14.3402C104.3 12.0759 102.464 10.2402 100.2 10.2402C97.9352 10.2402 96.0996 12.0759 96.0996 14.3402C96.0996 16.6046 97.9352 18.4402 100.2 18.4402Z" stroke="#1BB57A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M109.76 92.3602C112.025 92.3602 113.86 90.5245 113.86 88.2602C113.86 85.9958 112.025 84.1602 109.76 84.1602C107.496 84.1602 105.66 85.9958 105.66 88.2602C105.66 90.5245 107.496 92.3602 109.76 92.3602Z" stroke="#1BB57A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.4906 92.3602C21.755 92.3602 23.5906 90.5245 23.5906 88.2602C23.5906 85.9958 21.755 84.1602 19.4906 84.1602C17.2263 84.1602 15.3906 85.9958 15.3906 88.2602C15.3906 90.5245 17.2263 92.3602 19.4906 92.3602Z" stroke="#1BB57A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col justify-start items-center gap-2">
            <div className="text-center text-[#1CB579] text-xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-8">
              Success
            </div>
            <div className="text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
              Check In Successful
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
