"use client";

import {
  useState,
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
} from "react";
import { STATUS_STYLE, type Trip, type TripStatus } from "../lib/payment-data";
import { PAYMENT_BANK_COLOR, formatPaymentMoney } from "./payment-table-styles";

const SLIP_MAX_BYTES = 5 * 1024 * 1024;

/** รูป mock ใน public — แสดงเป็นสลิปตัวอย่างเพื่อทดสอบ Confirm */
const MOCK_SLIP_SAMPLE_SRC = "/mock-slip-sample.png";

/** รูปจากบาง OS/เบราว์เซอร์มี MIME ว่างหรือเป็น webp — รับทุก image/* ที่ขนาดไม่เกิน */
function slipFileAllowed(f: File): boolean {
  if (f.size === 0 || f.size > SLIP_MAX_BYTES) return false;
  const t = f.type.trim().toLowerCase();
  if (t.startsWith("image/")) return true;
  return /\.(jpe?g|png|heic|heif|webp|gif|bmp|tiff?)$/i.test(f.name);
}

export function AttachmentSlipModal({
  open,
  onClose,
  trip,
  localStatus,
  grandTotal,
  onConfirmSuccess,
}: {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  localStatus: TripStatus;
  grandTotal: number;
  /** URL แสดงใน Attachment บนหน้า (blob: หรือ path ใน public) */
  onConfirmSuccess: (previewSrc: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  /** แสดงสลิปตัวอย่างจาก public (mock) — เปิด modal ใหม่จะรีเซ็ตเป็นมีตัวอย่าง */
  const [showDemoSample, setShowDemoSample] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (open) {
      setFiles([]);
      setShowDemoSample(true);
    }
  }, [open]);

  const previewUrls = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useLayoutEffect(() => {
    return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
  }, [previewUrls]);

  if (!open) return null;

  const bankTint = PAYMENT_BANK_COLOR[trip.bankName] ?? "#265ed6";
  const st = STATUS_STYLE[localStatus];
  const tripTimeLabel = trip.tripRound.replace(/\s*:\s*/g, " : ");
  const photoCount = (showDemoSample ? 1 : 0) + files.length;
  const photoLabel =
    photoCount === 0 ? "0 photo added" : photoCount === 1 ? "1 photo added" : `${photoCount} photos added`;
  const confirmEnabled = photoCount > 0;

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    e.target.value = "";
    if (!list?.length) return;
    const next: File[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (slipFileAllowed(f)) next.push(f);
    }
    if (next.length) setFiles(prev => [...prev, ...next]);
  };

  const handleConfirm = () => {
    if (!confirmEnabled) return;
    const previewSrc = files.length > 0 ? URL.createObjectURL(files[0]) : MOCK_SLIP_SAMPLE_SRC;
    onConfirmSuccess(previewSrc);
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4 font-['IBM_Plex_Sans_Thai']"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[800px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attachment-slip-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative shrink-0 px-6 pt-6 pb-3 pl-12 pr-6">
          <button
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-[#2a2a2a] hover:bg-gray-100"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 id="attachment-slip-title" className="text-lg font-semibold leading-7 tracking-tight text-[#142b41]">
              Attachment
            </h2>
            <div className="h-1 w-[210px] max-w-full rounded-full bg-[#97bee4]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-8 items-center gap-1 rounded-[100px] border border-[#fd5c04] bg-white px-2 py-0.5 text-sm text-[#fd5c04]">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fd5c04" strokeWidth={1.5} className="shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {trip.date}
                </span>
                <span className="inline-flex h-8 items-center gap-1 rounded-[100px] border border-[#1cb579] bg-white px-2 py-0.5 text-sm text-[#1cb579]">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1cb579" strokeWidth={1.5} className="shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  {tripTimeLabel}
                </span>
                <span className="inline-flex h-8 items-center gap-1 rounded-[100px] border border-[#265ed6] bg-[#f8fcff] px-2 py-0.5 text-sm text-[#265ed6]">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5} className="shrink-0">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                  {trip.tripType}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-center gap-1 rounded-2xl px-2 py-0.5"
                  style={{ background: st.bg }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: st.color }} />
                  <span className="text-sm font-normal leading-[18px] tracking-tight" style={{ color: st.color }}>
                    {localStatus}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-[30px] bg-[#f8f8f8] px-2 py-1 text-sm text-[#142b41]">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#265ed6]">
                    <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  {trip.checkedIn}/{trip.paxAdv}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5} className="shrink-0">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M8 12h8M8 8h8M8 16h5"/>
                </svg>
                <span className="text-base font-medium leading-6 tracking-tight text-[#265ed6]">
                  Trip Code No. {trip.tripCode}
                </span>
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:gap-6 text-base font-medium leading-6 text-[#2a2a2a]">
                <span className="shrink-0">Program name</span>
                <span className="shrink-0">:</span>
                <span className="min-w-0 flex-1">{trip.program}</span>
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:gap-6 text-base font-medium leading-6 text-[#2a2a2a]">
                <span className="w-[108px] shrink-0">Remark</span>
                <span className="shrink-0">:</span>
                <span className="min-w-0 flex-1 text-[#2a2a2a]">-</span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              <div className="flex flex-col gap-3">
                <div className="text-base font-medium leading-6 text-[#265ed6]">Guide Information </div>
                <div className="flex flex-wrap items-start gap-2 sm:gap-6">
                  <span className="w-[108px] shrink-0 text-base font-medium leading-6 text-[#2a2a2a]">Guide Name</span>
                  <span className="shrink-0 text-base font-medium">:</span>
                  <span className="min-w-0 flex-1 text-base font-normal leading-6 text-[#2a2a2a]">{trip.guide}</span>
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:gap-6">
                  <span className="w-[108px] shrink-0 text-base font-medium leading-6 text-[#2a2a2a]">Book Bank</span>
                  <span className="shrink-0 text-base font-medium">:</span>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: bankTint }}
                    >
                      ฿
                    </span>
                    <span className="text-base font-normal leading-6 text-[#2a2a2a]">
                      {trip.bankName} : {trip.bankNo} {trip.guide}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[#d9d9d9]" />

          <div className="flex flex-wrap gap-[18px] text-base font-medium text-[#265ed6]">
            <span>Total Advanced</span>
            <span>:</span>
            <span className="tabular-nums">{formatPaymentMoney(grandTotal)}</span>
          </div>

          <div className="rounded-2xl border border-[#d9d9d9] bg-white p-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onFileInput}
            />
            <div className="flex flex-col gap-2">
              <div className="text-base font-medium text-[#265ed6]">Upload photos here</div>
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-start gap-3">
                  {showDemoSample ? (
                    <div className="relative h-[75px] w-[75px] shrink-0 overflow-hidden rounded-[10px] border-2 border-amber-200 bg-gray-50">
                      <img
                        src={MOCK_SLIP_SAMPLE_SRC}
                        alt="ตัวอย่างสลิป"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-0.5 py-0.5 text-center text-[9px] font-medium leading-tight text-white">
                        ตัวอย่าง
                      </span>
                    </div>
                  ) : null}
                  {previewUrls.map((url, i) => (
                    <div
                      key={`${files[i]?.name}-${i}`}
                      className="relative h-[75px] w-[75px] shrink-0 overflow-hidden rounded-[10px] border-2 border-gray-200 bg-gray-50 bg-cover bg-center"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex h-[75px] w-[75px] shrink-0 flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-gray-200 bg-gray-50 text-[#d1d5dc] hover:border-[#97bee4] hover:bg-blue-50/30"
                    aria-label="เพิ่มรูป"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.33}>
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs font-medium text-[#6a7282]">{photoLabel}</p>
              </div>
              <p className="text-xs font-normal leading-[18px] text-[#b9b9b9]">
                Supported files: common image types (JPG, PNG, WebP, HEIC, …), max 5 MB per file.
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-4 border-t border-[#e7e7e9] bg-[#f8f8f8] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[100px] border border-[#265ed6] bg-white px-5 py-2 text-base font-medium leading-6 tracking-tight text-[#265ed6] hover:bg-blue-50/60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmEnabled}
            onClick={handleConfirm}
            className={`rounded-[100px] px-5 py-2 text-base font-medium leading-6 tracking-tight ${
              confirmEnabled
                ? "bg-[#265ed6] text-white hover:opacity-95"
                : "cursor-not-allowed bg-[#e5e5e5] text-[#a3a3a3]"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
