"use client";

import { useState, useEffect } from "react";
import {
  MinusIcon,
  PlusIcon,
  XCircleIcon,
  CalendarIcon,
  PhotoIcon,
  ClockIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface NoShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInPax: number;
  bookingQuantity: number;
  noShowPax: number;
  bookingNo: string;
  travelDate: string;
  tripRound: string;
  customerName?: string;
  pricePerPax: number;
  onConfirm: (condition: string, data?: unknown) => void;
  onLater?: (noShowPax: number) => void;
}

type ModalType = "select" | "condition" | "fullCharge" | "reschedule" | "rescheduleWarning" | "refund";
type ConditionChoice = "fullCharge" | "reschedule" | "refund";

export default function NoShowModal({
  isOpen,
  onClose,
  checkInPax,
  bookingQuantity,
  noShowPax,
  bookingNo,
  travelDate,
  tripRound,
  customerName = "",
  pricePerPax,
  onConfirm,
  onLater,
}: NoShowModalProps) {
  const [modalType, setModalType] = useState<ModalType>("select");
  const [noShowCount, setNoShowCount] = useState(noShowPax > 0 ? noShowPax : bookingQuantity);
  const [selectedCondition, setSelectedCondition] = useState<ConditionChoice | "">("");

  useEffect(() => {
    if (isOpen) {
      // ถ้ามี noShowPax > 0 (มาจาก Check In ที่ลดจำนวน) ให้ใช้ค่า noShowPax และเริ่มจากหน้า "condition"
      // ถ้าไม่มี (เปิดจากปุ่ม No Show โดยตรง) ให้ใช้ bookingQuantity และเริ่มจากหน้า "select"
      if (noShowPax > 0) {
        setNoShowCount(noShowPax);
        setModalType("condition"); // ข้ามหน้า select ไปหน้า condition เลย
      } else {
        setNoShowCount(bookingQuantity);
        setModalType("select");
      }
    }
  }, [isOpen, bookingQuantity, noShowPax]);

  useEffect(() => {
    if (!isOpen) {
      setModalType("select");
      setSelectedCondition("");
      // Reset reschedule form when modal closes
      setRescheduleTravelDate("17/12/2025");
      setRescheduleTripRound("");
      setSelectedSuggestion("");
      setAdditionalFee("0");
      // Reset refund form when modal closes
      setRefundReason("");
      setRefundOtherReason("");
      setRefundRemarks("");
      setRefundPhotos([]);
      setShowReasonDropdown(false);
    }
  }, [isOpen]);

  // Refund form state
  const [refundReason, setRefundReason] = useState("");
  const [refundOtherReason, setRefundOtherReason] = useState("");
  const [refundRemarks, setRefundRemarks] = useState("");
  const [refundPhotos, setRefundPhotos] = useState<File[]>([]);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  // Reschedule form state
  const [rescheduleTravelDate, setRescheduleTravelDate] = useState("17/12/2025");
  const [rescheduleTripRound, setRescheduleTripRound] = useState("");
  const [additionalFee, setAdditionalFee] = useState("0");
  const [rescheduleReason, setRescheduleReason] = useState("Test");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const allSuggestions = [
    { code: "25L2KQ", date: "27/01/2026", round: "09:00", pax: "6/30" },
    { code: "25T5XZ", date: "27/01/2026", round: "10:00", pax: "8/30" },
    { code: "25M6UV", date: "27/01/2026", round: "11:00", pax: "5/30" },
  ];

  // Filter suggestions based on selected Trip Round
  const suggestions = rescheduleTripRound
    ? allSuggestions.filter((s) => s.round === rescheduleTripRound)
    : allSuggestions;

  // Clear selected suggestion when Trip Round changes
  useEffect(() => {
    if (rescheduleTripRound) {
      setSelectedSuggestion("");
    }
  }, [rescheduleTripRound]);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showReasonDropdown && !target.closest('[data-reason-dropdown]')) {
        setShowReasonDropdown(false);
      }
    };
    if (showReasonDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReasonDropdown]);

  const refundAmount = pricePerPax * noShowCount;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setRefundPhotos(Array.from(e.target.files));
    }
  };

  const handleConfirm = () => {
    if (modalType === "select") {
      setModalType("condition");
      return;
    }
    if (modalType === "condition") {
      if (selectedCondition === "fullCharge") {
        onConfirm("noShowCount", { noShowPax: noShowCount, condition: "fullCharge" });
        onClose();
        return;
      }
      if (selectedCondition === "reschedule") {
        setModalType("reschedule");
        return;
      }
      if (selectedCondition === "refund") {
        setModalType("refund");
        return;
      }
      return;
    }
    if (modalType === "refund") {
      if (refundReason) {
        // ถ้าเป็น Other Reason ต้องมี refundOtherReason ด้วย
        if (refundReason === "other_reason" && !refundOtherReason.trim()) {
          return; // ไม่ให้ submit ถ้ายังไม่ได้กรอก Other Reason
        }
        onConfirm("refund", {
          reason: refundReason,
          otherReason: refundReason === "other_reason" ? refundOtherReason : undefined,
          remarks: refundRemarks,
          photos: refundPhotos,
          amount: refundAmount,
          noShowPax: noShowCount,
        });
        onClose();
      }
    } else if (modalType === "reschedule") {
      if (rescheduleTravelDate && rescheduleTripRound) {
        // ไปหน้า warning ก่อน
        setModalType("rescheduleWarning");
        return;
      }
    } else if (modalType === "rescheduleWarning") {
      // ยืนยัน Reschedule แล้ว
      onConfirm("reschedule", {
        travelDate: rescheduleTravelDate,
        tripRound: rescheduleTripRound,
        additionalFee: parseFloat(additionalFee || "0"),
        reason: rescheduleReason,
        suggestion: selectedSuggestion,
        noShowPax: noShowCount,
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (modalType === "rescheduleWarning") {
      setModalType("reschedule");
      return;
    }
    setModalType("select");
    setSelectedCondition("");
  };

  const handleConditionBack = () => {
    setModalType("select");
    setSelectedCondition("");
  };

  const handleLater = () => {
    onLater?.(noShowCount);
    onClose();
  };

  if (!isOpen) return null;

  const isSelectOrCondition = modalType === "select" || modalType === "condition";
  const isRescheduleOrRefund = modalType === "reschedule" || modalType === "refund" || modalType === "rescheduleWarning";
  const useCompactHeader = isSelectOrCondition || (modalType === "refund");
  const modalWidthClass =
    modalType === "select" ? "max-w-[464px]" : modalType === "condition" || isRescheduleOrRefund ? "max-w-[548px] max-h-[90vh]" : "max-w-2xl max-h-[90vh] overflow-y-auto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] w-full mx-4 flex flex-col overflow-hidden ${modalWidthClass}`}>
        {/* Part 1: Header — fixed (Reschedule และ Refund ใช้บล็อกแยก, อื่นใช้หัวเดิม) */}
        {modalType === "reschedule" || modalType === "refund" ? (
          <div className="shrink-0 self-stretch pl-12 pr-6 pt-6 pb-3 bg-white inline-flex justify-center items-start gap-2.5">
            <div className="flex-1 inline-flex flex-col justify-start items-center gap-3">
              <div className="self-stretch inline-flex justify-center items-center gap-3">
                <div className="text-center justify-start text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                  {modalType === "reschedule" ? "Reschedule" : "Refund"}
                </div>
              </div>
              <div className="w-52 h-0 outline outline-4 outline-offset-[-2px] outline-blue-300" />
            </div>
            <button type="button" onClick={onClose} className="size-6 relative overflow-hidden flex items-center justify-center rounded hover:bg-gray-100" aria-label="ปิด">
              <span className="size-3 outline outline-[1.67px] outline-offset-[-0.83px] outline-zinc-800" />
            </button>
          </div>
        ) : modalType === "rescheduleWarning" ? (
          <div className="shrink-0 self-stretch pl-12 pr-6 pt-6 pb-3 bg-white inline-flex justify-center items-start gap-2.5">
            <div className="flex-1 inline-flex flex-col justify-start items-center gap-3">
              <div className="self-stretch inline-flex justify-center items-center gap-3">
                <div className="text-center justify-start text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Reschedule</div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="size-6 relative overflow-hidden flex items-center justify-center rounded hover:bg-gray-100" aria-label="ปิด">
              <span className="size-3 outline outline-[1.67px] outline-offset-[-0.83px] outline-zinc-800" />
            </button>
          </div>
        ) : (
          <div className={`shrink-0 ${useCompactHeader
            ? "self-stretch pt-6 pb-3 pl-12 pr-6 bg-white inline-flex justify-center items-start gap-2.5"
            : "flex items-center justify-between p-6 border-b border-gray-200"
          }`}>
            <div className="flex-1 flex flex-col justify-start items-center gap-3">
              <h2 className={`self-stretch text-center font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight ${useCompactHeader ? "text-zinc-800 text-lg" : "text-xl text-gray-900"}`}>
                {modalType === "select" ? "No show" : modalType === "condition" ? "Select No-show Condition" : ""}
              </h2>
            </div>
            <button type="button" onClick={onClose} className={useCompactHeader ? "size-6 flex items-center justify-center overflow-hidden rounded hover:bg-gray-100" : "p-2 hover:bg-gray-100 rounded-lg transition-colors"} aria-label="ปิด">
              <span className="size-3 rounded-sm outline outline-[1.67px] outline-offset-[-0.83px] outline-zinc-800" />
            </button>
          </div>
        )}

        {/* Part 2: Content — scroll ได้เมื่อยาว, ส่วน 1 กับ 3 fixed */}
        <div className={
          modalType === "select" || modalType === "condition"
            ? "p-6 flex flex-col justify-start items-start gap-6 overflow-y-auto min-h-0 flex-1"
            : modalType === "reschedule"
            ? "flex-1 min-h-0 overflow-y-auto flex flex-col"
            : modalType === "rescheduleWarning"
            ? "p-8 flex flex-col justify-center items-center gap-6 overflow-y-auto min-h-0 flex-1"
            : modalType === "refund"
            ? "flex-1 min-h-0 overflow-y-auto flex flex-col"
            : isRescheduleOrRefund
            ? "p-6 flex flex-col justify-start items-start gap-6 overflow-y-auto min-h-0 flex-1"
            : "p-6 overflow-y-auto min-h-0 flex-1"
        }>
          {modalType === "select" ? (
            <>
              <div className="self-stretch inline-flex justify-start items-center gap-3">
                <div className="text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Select the number of Pax who did not show up.
                </div>
              </div>
              <div className="w-full px-6 py-3 bg-[#F8FCFF] rounded-[10px] flex flex-col justify-start items-start gap-3 overflow-hidden">
                <div className="w-full flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                    <div className="w-[180px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Booking No.</div>
                      <div className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">{bookingNo}</div>
                    </div>
                    <div className="w-[180px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Travel date / Trip Round :</div>
                      <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">{travelDate} : {tripRound.replace(":", " : ")}</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                    <div className="w-[180px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Customer</div>
                      <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">{customerName || "-"}</div>
                    </div>
                    <div className="w-[180px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="text-[#848484] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Original Pax</div>
                      <div className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">{bookingQuantity} Pax</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-3">
                <div className="text-center text-[#2A2A2A] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">No Show</div>
                <div data-property-1={String(noShowCount)} className="p-3 rounded-lg flex flex-col justify-center items-center gap-6">
                  <div className="flex flex-col justify-center items-center gap-3">
                    <div className="inline-flex justify-start items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNoShowCount((c) => Math.max(0, c - 1))}
                        disabled={noShowCount <= 0}
                        className="size-6 p-1 rounded-full outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center disabled:opacity-50 disabled:outline-zinc-300"
                      >
                        <MinusIcon className="size-4 text-[#265ED6]" />
                      </button>
                      <div className="w-20 py-2 px-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-[#B9B9B9] flex justify-center items-center">
                        <span className="text-[#2A2A2A] text-xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-8">{noShowCount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoShowCount((c) => Math.min(bookingQuantity, c + 1))}
                        disabled={noShowCount >= bookingQuantity}
                        className={`size-6 p-1 rounded-full flex justify-center items-center ${
                          noShowCount >= bookingQuantity
                            ? "bg-[#E7E7E9]"
                            : "outline outline-1 outline-offset-[-1px] outline-[#265ED6]"
                        }`}
                      >
                        <PlusIcon className={`size-4 ${noShowCount >= bookingQuantity ? "text-gray-500" : "text-[#265ED6]"}`} />
                      </button>
                    </div>
                    <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">/ {bookingQuantity} Pax</div>
                  </div>
                </div>
              </div>
            </>
          ) : modalType === "condition" ? (
            <>
              <div className="self-stretch inline-flex justify-start items-center gap-3">
                <button type="button" onClick={handleConditionBack} className="size-6 flex items-center justify-center text-[#265ED6] hover:bg-blue-50/50 rounded">
                  <ChevronRightIcon className="size-5" style={{ transform: "rotate(180deg)" }} />
                </button>
                <div className="text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Checked in {bookingQuantity - noShowCount} Pax from {bookingQuantity} Pax (No-show {noShowCount} Pax)
                </div>
              </div>
              <div className="flex flex-col justify-start items-start gap-2 w-full max-w-[500px]">
                {/* No-show Full Charge */}
                <button
                  type="button"
                  onClick={() => setSelectedCondition("fullCharge")}
                  data-name="No-show Full Charge"
                  data-type="Default"
                  className={`w-full min-h-[102px] bg-white rounded-lg border flex flex-col justify-center items-start gap-6 transition-colors ${
                    selectedCondition === "fullCharge"
                      ? "border-2 border-[#265ED6]"
                      : "border border-[#F8F8F8] hover:border-[#265ED6]"
                  }`}
                >
                  <div className="self-stretch p-6 flex flex-col justify-center items-center gap-6">
                    <div className="self-stretch inline-flex justify-start items-start gap-2">
                      <div className="size-8 p-1 bg-[#FFEBE8] rounded-full flex justify-center items-center shrink-0">
                        <XCircleIcon className="size-5 text-[#D91616]" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-start gap-2 min-w-0">
                        <div className="text-[#2A2A2A] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">No-show Full Charge</div>
                        <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">No refund for no-show passengers</div>
                      </div>
                      <div className="h-8 px-4 py-1 bg-[#FFF8F6] rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-[#D91616] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">Full Charge</span>
                      </div>
                    </div>
                  </div>
                </button>
                {/* Reschedule */}
                <button
                  type="button"
                  onClick={() => setSelectedCondition("reschedule")}
                  data-name="Reschedule"
                  data-type="Default"
                  className={`w-full min-h-[102px] bg-white rounded-lg border flex flex-col justify-center items-start gap-6 transition-colors ${
                    selectedCondition === "reschedule"
                      ? "border-2 border-[#265ED6]"
                      : "border border-[#F8F8F8] hover:border-[#265ED6]"
                  }`}
                >
                  <div className="self-stretch p-6 flex flex-col justify-center items-center gap-6">
                    <div className="self-stretch inline-flex justify-start items-start gap-2">
                      <div className="size-8 p-1 bg-[#DCEEFF] rounded-full flex justify-center items-center shrink-0">
                        <CalendarIcon className="size-5 text-[#265ED6]" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-start gap-2 min-w-0">
                        <div className="text-[#2A2A2A] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">Reschedule</div>
                        <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">Reschedule Travel date</div>
                      </div>
                      <div className="w-[87px] h-8 px-4 py-1 bg-[#F8FCFF] rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-[#265ED6] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">Reschedule</span>
                      </div>
                    </div>
                  </div>
                </button>
                {/* Refund */}
                <button
                  type="button"
                  onClick={() => setSelectedCondition("refund")}
                  data-name="Refund"
                  data-type="Default"
                  className={`w-full min-h-[102px] bg-white rounded-lg border flex flex-col justify-center items-start gap-6 transition-colors ${
                    selectedCondition === "refund"
                      ? "border-2 border-[#265ED6]"
                      : "border border-[#F8F8F8] hover:border-[#265ED6]"
                  }`}
                >
                  <div className="self-stretch p-6 flex flex-col justify-center items-center gap-6">
                    <div className="self-stretch inline-flex justify-start items-start gap-2">
                      <div className="size-8 p-1 bg-[#E6F3E6] rounded-full flex justify-center items-center shrink-0">
                        <CheckCircleIcon className="size-5 text-[#1CB579]" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-start gap-2 min-w-0">
                        <div className="text-[#2A2A2A] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">Refund</div>
                        <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">Full refund for no-show passengers</div>
                      </div>
                      <div className="w-[87px] h-8 px-4 py-1 bg-[#E6F3E6] rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-[#1CB579] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">Refund</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : modalType === "refund" ? (
            <div className="self-stretch p-6 flex flex-col justify-start items-start gap-6">
              {/* Original Booking — ตรง Figma */}
              <div className="self-stretch px-6 py-3 bg-slate-50 rounded-[10px] flex flex-col justify-start items-start overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="justify-start text-stone-500 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">Original Booking</div>
                  <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Booking No.</div>
                      <div className="justify-start text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingNo}</div>
                    </div>
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Travel date :</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{travelDate}</div>
                    </div>
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Trip Round</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{tripRound.replace(":", " : ")}</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-2">
                    <div className="w-36 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">No-show:</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                        {noShowCount} Pax
                        <span className="text-zinc-500 text-xs ml-1 font-normal">from {bookingQuantity} Pax</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Amount — card สีน้ำเงินอ่อน */}
              <div className="self-stretch px-6 py-4 bg-blue-50 rounded-[10px] flex justify-between items-center">
                <div className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Refund Amount</div>
                <div className="text-right">
                  <div className="text-blue-700 text-xl font-bold font-['IBM_Plex_Sans_Thai'] leading-7">
                    ฿ {refundAmount.toLocaleString()}
                  </div>
                  <div className="text-zinc-500 text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-4 mt-1">
                    (฿{pricePerPax.toLocaleString()} per pax × {noShowCount})
                  </div>
                </div>
              </div>

              {/* Reason — dropdown แบบ Figma, ถ้าเลือก Other Reason จะแสดง input เพิ่ม */}
              <div className="w-[508px] flex flex-col justify-start items-start gap-1 relative" data-reason-dropdown>
                <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">
                  Reason <span className="text-red-500">*</span>
                </div>
                <div className="w-full relative">
                  <button
                    type="button"
                    onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                    className="w-full px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 text-zinc-800 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight flex justify-between items-center hover:bg-zinc-50 transition-colors"
                  >
                    <span className={refundReason ? "" : "text-zinc-400"}>
                      {refundReason === "health_issue" ? "Health Issue / Medical Condition" :
                       refundReason === "bad_weather" ? "Bad Weather" :
                       refundReason === "personal_emergency" ? "Personal Emergency" :
                       refundReason === "person_not_allowed" ? "Person not allowed" :
                       refundReason === "other_reason" ? "Other Reason" :
                       "Please select"}
                    </span>
                    <svg className="w-4 h-4 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showReasonDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 w-full rounded-lg shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.06)] shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] bg-white z-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setRefundReason("health_issue");
                          setShowReasonDropdown(false);
                        }}
                        className="self-stretch h-10 px-6 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-zinc-50 transition-colors w-full"
                      >
                        <div className="flex-1 flex justify-start items-start gap-2">
                          <div className="h-6 flex justify-start items-start gap-2">
                            <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Health Issue / Medical Condition</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRefundReason("bad_weather");
                          setShowReasonDropdown(false);
                        }}
                        className="self-stretch h-10 px-6 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-zinc-50 transition-colors w-full"
                      >
                        <div className="flex-1 flex justify-start items-start gap-2">
                          <div className="h-6 flex justify-start items-start gap-2">
                            <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Bad Weather</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRefundReason("personal_emergency");
                          setShowReasonDropdown(false);
                        }}
                        className="self-stretch h-10 px-6 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-zinc-50 transition-colors w-full"
                      >
                        <div className="flex-1 flex justify-start items-start gap-2">
                          <div className="h-6 flex justify-start items-start gap-2">
                            <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Personal Emergency</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRefundReason("person_not_allowed");
                          setShowReasonDropdown(false);
                        }}
                        className="self-stretch h-10 px-6 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-zinc-50 transition-colors w-full"
                      >
                        <div className="flex-1 flex justify-start items-start gap-2">
                          <div className="h-6 flex justify-start items-start gap-2">
                            <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Person not allowed</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRefundReason("other_reason");
                          setShowReasonDropdown(false);
                        }}
                        className="self-stretch h-10 px-6 py-2 bg-white inline-flex justify-start items-center gap-2 hover:bg-zinc-50 transition-colors w-full"
                      >
                        <div className="flex-1 flex justify-start items-start gap-2">
                          <div className="h-6 flex justify-start items-start gap-2">
                            <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Other Reason</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Other Reason Input — แสดงเมื่อเลือก Other Reason */}
                {refundReason === "other_reason" && (
                  <div className="w-full flex flex-col justify-start items-start gap-1 mt-2">
                    <input
                      type="text"
                      value={refundOtherReason}
                      onChange={(e) => setRefundOtherReason(e.target.value)}
                      placeholder="Please enter"
                      className="w-full px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 text-zinc-800 placeholder:text-zinc-400 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                    />
                  </div>
                )}
              </div>

              {/* Remarks — outline-zinc-300, placeholder text-zinc-400 */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Remarks</div>
                <textarea
                  value={refundRemarks}
                  onChange={(e) => setRefundRemarks(e.target.value)}
                  className="self-stretch px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 text-zinc-800 placeholder:text-zinc-400 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight resize-none"
                  rows={3}
                  placeholder="Please enter"
                />
              </div>

              {/* Upload Photos — ตรง Figma ตาม inline style ที่ให้มา */}
              <div className="self-stretch inline-flex flex-col justify-start items-start gap-2">
                <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Upload Photos</div>
                <div className="w-full max-w-[508px] px-[15px] py-[7px] bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#D9D9D9] flex flex-col justify-center items-start gap-[10px]">
                  {/* Header: "Upload photos here" + ปุ่ม X */}
                  <div className="self-stretch inline-flex justify-start items-center gap-[10px]">
                    <div className="flex-1 flex justify-center flex-col text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                      Upload photos here
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-[10px]">
                      <button
                        type="button"
                        onClick={() => setRefundPhotos([])}
                        className="size-6 relative overflow-hidden flex items-center justify-center hover:bg-zinc-100 rounded transition-colors"
                        aria-label="ลบรูปทั้งหมด"
                      >
                        <span className="size-3 outline outline-[1.67px] outline-offset-[-0.83px] outline-zinc-800" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Photo Input Area */}
                  <div className="self-stretch h-[100.80px] flex flex-col justify-start items-start gap-[10px]">
                    <div className="self-stretch pr-[83px] inline-flex justify-start items-center gap-3">
                      <button
                        type="button"
                        onClick={() => document.getElementById("refund-photo-upload")?.click()}
                        className="w-[74.80px] h-[74.80px] bg-[#F9FAFB] rounded-[10px] outline outline-2 outline-offset-[-2px] outline-[#E5E7EB] flex flex-col justify-center items-center hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-zinc-400 text-2xl font-normal leading-none">+</span>
                      </button>
                    </div>
                    
                    {/* Status: "X photo added" */}
                    <div className="self-stretch h-4 flex justify-between items-center">
                      <div className="text-[#6A7282] text-xs font-medium font-['Inter'] leading-4">
                        {refundPhotos.length} photo{refundPhotos.length !== 1 ? "s" : ""} added
                      </div>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    id="refund-photo-upload"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/heic"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {/* Footer: Supported files */}
                <div className="self-stretch flex flex-col justify-start items-center gap-2">
                  <div className="text-center text-[#B9B9B9] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
                    Supported files: JPG, PNG, Heic, JPEG, size not exceeding 5 MB.
                  </div>
                </div>
              </div>
            </div>
          ) : modalType === "rescheduleWarning" ? (
            /* Reschedule Warning — แสดงข้อความเตือนก่อน Reschedule */
            <div className="self-stretch flex flex-col justify-center items-center gap-6">
              <div className="self-stretch flex flex-col justify-center items-center gap-4">
                {/* Icon Warning */}
                <div className="w-[124px] h-[110px] relative overflow-hidden flex items-center justify-center">
                  <div className="size-[82px] rounded-full border-[3px] border-[#FEC111] flex items-center justify-center bg-[#FBF2D9]/30">
                    <svg
                      className="size-10 text-[#FEC111]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col justify-start items-center gap-2">
                  <div className="text-center text-[#FFC107] text-xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-8">
                    Warning
                  </div>
                  <div className="text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em] max-w-md">
                    Booking นี้จะถูก Reschedule ไปยังทริปอื่นแล้ว
                    <br />
                    <span className="font-medium">กรุณาลบ Booking นี้ออกจากการ Check In</span> เพราะย้ายไปทริปอื่นแล้ว
                  </div>
                  <div className="mt-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center text-blue-700 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-5">
                      <div className="font-medium mb-1">รายละเอียดการ Reschedule:</div>
                      <div>Travel Date: {rescheduleTravelDate}</div>
                      <div>Trip Round: {rescheduleTripRound.replace(":", " : ")}</div>
                      {selectedSuggestion && <div>Trip Code: {selectedSuggestion}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Reschedule — ตรง Figma: Original Booking 2 แถว, inputs zinc-300, Suggestion blue-700, Summary slate-800, footer stone-50 */
            <div className="self-stretch p-6 flex flex-col justify-start items-start gap-6">
              {/* Original Booking — แถว1: Booking No. | Travel date | Trip Round, แถว2: No-show | Price */}
              <div className="self-stretch px-6 py-3 bg-[#F8FCFF] rounded-[10px] flex flex-col justify-start items-start overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="justify-start text-stone-500 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">Original Booking</div>
                  <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Booking No.</div>
                      <div className="justify-start text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingNo}</div>
                    </div>
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Travel date :</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{travelDate}</div>
                    </div>
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Trip Round</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{tripRound.replace(":", " : ")}</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-2">
                    <div className="w-36 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">No-show:</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{noShowCount} Pax</div>
                    </div>
                    <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                      <div className="justify-start text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Price :</div>
                      <div className="justify-start text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">฿ {(pricePerPax * noShowCount).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Date & Trip Round — แถวเดียวกัน, ขอบ zinc-300, ไอคอนในช่อง */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch inline-flex justify-start items-start gap-6 flex-nowrap">
                  <div className="w-60 shrink-0 inline-flex flex-col justify-center items-start gap-1">
                    <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Travel Date</div>
                    <div className="self-stretch px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex items-center gap-2 cursor-pointer hover:outline-zinc-400 transition-colors">
                      <CalendarIcon className="size-5 text-zinc-500 shrink-0 pointer-events-none" />
                      <input
                        type="date"
                        min={today}
                        value={rescheduleTravelDate.split("/").reverse().join("-")}
                        onChange={(e) => {
                          const date = e.target.value.split("-").reverse().join("/");
                          setRescheduleTravelDate(date);
                        }}
                        className="flex-1 min-w-0 bg-transparent text-zinc-800 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight outline-none cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                      />
                    </div>
                  </div>
                  <div className="w-60 shrink-0 inline-flex flex-col justify-start items-start gap-1">
                    <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Trip Round</div>
                    <div className="self-stretch px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex items-center gap-2">
                      <ClockIcon className="size-5 text-zinc-500 shrink-0" />
                      <select
                        value={rescheduleTripRound}
                        onChange={(e) => {
                          setRescheduleTripRound(e.target.value);
                          setSelectedSuggestion("");
                        }}
                        className="flex-1 min-w-0 bg-transparent text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight outline-none text-zinc-800 [&>option:first-child]:text-zinc-400"
                      >
                        <option value="">Please select</option>
                        <option value="07:00">07 : 00</option>
                        <option value="08:00">08 : 00</option>
                        <option value="09:00">09 : 00</option>
                        <option value="10:00">10 : 00</option>
                        <option value="11:00">11 : 00</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Suggestion — หัวข้อ blue-700, กรอบ outline-zinc-300, Pax ไอคอนน้ำเงิน + pill stone-50 */}
                <div className="w-full max-w-[500px] p-6 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 flex flex-col justify-start items-start gap-6 overflow-hidden">
                  <div className="justify-start text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Suggestion</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-start items-start">
                      <div className="w-36 flex justify-start items-center gap-2">
                        <div className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Trip code</div>
                      </div>
                      <div className="w-28 flex justify-start items-center gap-2">
                        <div className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Travel Date</div>
                      </div>
                      <div className="w-20 flex justify-start items-center gap-2">
                        <div className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Trip round</div>
                      </div>
                      <div className="w-24 flex justify-center items-center gap-2">
                        <div className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Pax</div>
                      </div>
                    </div>
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-300" />
                    <div className="self-stretch flex flex-col justify-start items-start gap-3 overflow-hidden">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div key={index} className="self-stretch inline-flex justify-start items-center">
                            <div className="flex-1 flex justify-start items-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="suggestion"
                                  value={suggestion.code}
                                  checked={selectedSuggestion === suggestion.code}
                                  onChange={(e) => {
                                    setSelectedSuggestion(e.target.value);
                                    setRescheduleTravelDate(suggestion.date);
                                    setRescheduleTripRound(suggestion.round);
                                  }}
                                  className="sr-only peer"
                                />
                                <div className={`size-6 rounded-full border-2 transition-colors ${
                                  selectedSuggestion === suggestion.code
                                    ? "bg-blue-700 border-blue-700"
                                    : "bg-transparent border-zinc-700"
                                } flex items-center justify-center`}>
                                  {selectedSuggestion === suggestion.code && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  )}
                                </div>
                              </label>
                              <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{suggestion.code}</div>
                            </div>
                            <div className="w-28 flex justify-start items-center gap-2">
                              <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{suggestion.date}</div>
                            </div>
                            <div className="w-20 flex justify-start items-center gap-2">
                              <div className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{suggestion.round.replace(":", " : ")}</div>
                            </div>
                            <div className="w-24 flex justify-start items-center gap-2">
                              <div className="h-7 px-2 py-1 bg-stone-50 rounded-[30px] inline-flex items-center justify-center gap-1">
                                <UserGroupIcon className="size-4 text-blue-700 shrink-0" />
                                <span className="text-slate-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4 tracking-tight">{suggestion.pax}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="self-stretch py-4 text-center text-zinc-500 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                          {rescheduleTripRound ? "ไม่พบ suggestion สำหรับรอบนี้" : "กรุณาเลือก Trip Round เพื่อดู suggestion"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional fee — placeholder ฿ 0.00, zinc-400 */}
              <div className="self-stretch inline-flex justify-start items-start gap-6">
                <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                  <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Additional fee</div>
                  <div className="self-stretch px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-2">
                    <input
                      type="text"
                      value={additionalFee}
                      onChange={(e) => setAdditionalFee(e.target.value.replace(/[^\d.]/g, ""))}
                      placeholder="฿ 0.00"
                      className="flex-1 min-w-0 bg-transparent text-zinc-800 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight outline-none placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Remark — placeholder Please enter */}
              <div className="self-stretch inline-flex justify-start items-center gap-6">
                <div className="flex-1 min-w-0 inline-flex flex-col justify-center items-start gap-1">
                  <div className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Remark</div>
                  <input
                    type="text"
                    placeholder="Please enter"
                    className="self-stretch px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 text-zinc-800 placeholder:text-zinc-400 text-base font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                  />
                </div>
              </div>

              {/* Summary — bg-slate-800, เส้นแบ่งขาวบางๆ */}
              <div className="self-stretch px-6 py-3 bg-slate-800 rounded-[10px] flex flex-col justify-start items-start overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Summary</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch inline-flex justify-start items-start gap-2">
                      <div className="flex-1 flex justify-start items-center gap-2.5">
                        <div className="flex-1 flex justify-start items-center gap-2.5">
                          <div className="text-white text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Additional Fee :</div>
                        </div>
                        <div className="flex-1 flex justify-end items-center gap-2.5">
                          <div className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">฿ {Number(additionalFee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-white/30" />
                    <div className="self-stretch inline-flex justify-start items-start gap-2">
                      <div className="flex-1 flex justify-start items-center gap-1">
                        <div className="flex-1 flex justify-start items-center gap-2.5">
                          <div className="text-white text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Total  :</div>
                        </div>
                        <div className="flex-1 flex justify-end items-center gap-2.5">
                          <div className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">฿ {Number(additionalFee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — ไม่เลื่อน */}
        <div className={
          "shrink-0 self-stretch p-6 overflow-hidden flex items-center gap-2.5 " +
          (modalType === "select" || modalType === "condition" ? "justify-between bg-[#F8F8F8]" : modalType === "rescheduleWarning" ? "justify-start bg-stone-50 gap-2" : isRescheduleOrRefund ? "justify-end bg-stone-50" : "justify-end border-t border-gray-200 bg-gray-50")
        }>
          {modalType === "select" ? (
            <div className="flex-1 flex justify-end items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
              >
                <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-[#FF3B3B] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Confirm</span>
              </button>
            </div>
          ) : modalType === "condition" ? (
            <>
              <div className="flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={handleLater}
                  className="px-5 py-2 bg-[#E3F1FF] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Later</span>
                </button>
              </div>
              <div className="flex-1 flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={handleConditionBack}
                  className="px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
                >
                  <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedCondition}
                  className={`px-5 py-2 rounded-[100px] flex justify-center items-center gap-2 transition-opacity ${
                    selectedCondition
                      ? "bg-[#265ED6] text-white hover:opacity-90"
                      : "bg-[#E7E7E9] text-white cursor-not-allowed"
                  }`}
                >
                  <span className="text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Confirm</span>
                </button>
              </div>
            </>
          ) : modalType === "rescheduleWarning" ? (
            <div className="self-stretch flex justify-start items-start gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
              >
                <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Cancel
                </span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-5 py-2 bg-[#265ED6] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  Ok
                </span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex justify-end items-start gap-2.5">
              <div className="flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-blue-700 flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
                >
                  <span className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Cancel</span>
                </button>
              </div>
              <div className="flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    modalType === "refund"
                      ? !refundReason || (refundReason === "other_reason" && !refundOtherReason.trim())
                      : !rescheduleTravelDate || !rescheduleTripRound
                  }
                  className={`px-5 py-2 rounded-[100px] flex justify-center items-center gap-2 ${
                    modalType === "refund"
                      ? refundReason && (refundReason !== "other_reason" || refundOtherReason.trim())
                        ? "bg-blue-700 text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : rescheduleTravelDate && rescheduleTripRound
                      ? "bg-blue-700 text-white hover:opacity-90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="text-center text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Confirm</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
