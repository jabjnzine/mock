"use client";

import { useState, use, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  INIT_TRIPS, SEC, STATUS_STYLE, initAdvSections,
  AdvanceSections, AdvanceItem, ExtraAdvanceItem, SectionKey, CostType,
  Trip,
} from "../../lib/payment-data";
import { formatPaymentMoney, PAYMENT_BANK_COLOR } from "../../components/payment-table-styles";
import { AttachmentSlipModal } from "../../components/AttachmentSlipModal";
import {
  advanceGetClientTripStatus,
  advanceGetTripAdvanceDraft,
  advanceGetTripSlipPreviewSrc,
  advanceMarkTripStatus,
  advanceRequestCompletedTab,
  advanceSetTripAdvanceDraft,
  advanceSetTripAdvanceTotals,
  advanceSetTripSlipPreviewSrc,
} from "../../lib/advance-client-state";

type PageMode = "view" | "edit";

// ─── APPROVE: WARNING → SUCCESS (ลำดับตามดีไซน์) ───────────────────────────────
function ApproveWarningIllustration() {
  return (
    <svg width={96} height={96} viewBox="0 0 96 96" fill="none" className="shrink-0" aria-hidden>
      <circle cx={48} cy={48} r={36} fill="#FFF8E1" stroke="#F9A825" strokeWidth={2}/>
      <circle cx={34} cy={40} r={4} fill="#F9A825"/>
      <circle cx={62} cy={40} r={4} fill="#F9A825"/>
      <path d="M38 52c4 8 16 8 20 0" stroke="#F9A825" strokeWidth={2.2} strokeLinecap="round"/>
      <path d="M52 28h8" stroke="#F9A825" strokeWidth={2.5} strokeLinecap="round"/>
      <text x={72} y={28} fill="#F9A825" fontSize={14} fontWeight={700}>!</text>
      <circle cx={22} cy={28} r={3} fill="#F9A825"/>
      <circle cx={76} cy={58} r={2.5} fill="#F9A825"/>
    </svg>
  );
}

function ApproveSuccessIllustration() {
  return (
    <svg width={96} height={96} viewBox="0 0 96 96" fill="none" className="shrink-0" aria-hidden>
      <circle cx={48} cy={48} r={36} fill="#ECFDF5" stroke="#22C55E" strokeWidth={2}/>
      <path d="M32 48l10 10 22-22" stroke="#16A34A" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={22} cy={32} r={2.5} fill="#22C55E"/>
      <circle cx={74} cy={36} r={2.5} fill="#22C55E"/>
      <path d="M24 58l4 4M70 62l4-4" stroke="#86EFAC" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  );
}

function ApproveWarningModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-70 p-4 font-['IBM_Plex_Sans_Thai']"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] max-w-[400px] w-full px-8 pt-10 pb-8 flex flex-col items-center gap-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-warning-title"
        onClick={e => e.stopPropagation()}
      >
        <ApproveWarningIllustration />
        <h2 id="approve-warning-title" className="text-xl font-bold text-[#F9A825] leading-7 tracking-tight text-center">
          Warning
        </h2>
        <p className="text-center text-[#2a2a2a] text-base font-normal leading-6 tracking-tight px-1">
          Do you want to Approve ?
        </p>
        <div className="flex flex-row justify-center items-stretch gap-3 w-full mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-w-0 px-5 py-2.5 rounded-[100px] border border-[#265ed6] bg-white text-[#265ed6] text-base font-medium leading-6 tracking-tight hover:bg-blue-50/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-w-0 px-5 py-2.5 rounded-[100px] bg-[#265ed6] text-white text-base font-medium leading-6 tracking-tight hover:opacity-95"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-70 p-4 font-['IBM_Plex_Sans_Thai']"
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] max-w-[400px] w-full px-8 pt-10 pb-8 flex flex-col items-center gap-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-success-title"
      >
        <ApproveSuccessIllustration />
        <h2 id="approve-success-title" className="text-xl font-bold text-[#16A34A] leading-7 tracking-tight text-center">
          Success
        </h2>
        <p className="text-center text-[#2a2a2a] text-base font-normal leading-6 tracking-tight px-1">
          Approve Successful
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full max-w-[200px] px-5 py-2.5 rounded-[100px] bg-[#265ed6] text-white text-base font-medium leading-6 tracking-tight hover:opacity-95"
        >
          Ok
        </button>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-7 right-7 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg z-50 flex items-center gap-2 ${
      type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
    }`}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

// ─── SECTION LABELS ──────────────────────────────────────────────────────────
const SECTION_LABELS: Record<SectionKey, string> = {
  guide:     "Guide Fee",
  vehicle:   "Vehicle Cost",
  other:     "Other Expense",
  allowance: "Allowance",
  extra:     "Extra Cost",
};

type ExtraModalRow = {
  id: string;
  /** อ้างอิงรายการใน Other Expense */
  sourceOtherId: string;
  remark: string;
  /** ต่อหน่วย — แก้ไขได้ (เริ่มจากค่าใน Other Expense) */
  costUnit: string;
};

function formatCostUnitForInput(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function createEmptyExtraModalRow(): ExtraModalRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sourceOtherId: "",
    remark: "",
    costUnit: "0.00",
  };
}

function AddExtraAdvanceModal({
  open,
  rows,
  otherExpenseItems,
  onRowsChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  rows: ExtraModalRow[];
  otherExpenseItems: AdvanceItem[];
  onRowsChange: (fn: (prev: ExtraModalRow[]) => ExtraModalRow[]) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const updateRow = (id: string, patch: Partial<ExtraModalRow>) =>
    onRowsChange(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const resolveSource = (sourceOtherId: string) =>
    otherExpenseItems.find(o => o.id === sourceOtherId);

  const parseCost = (s: string) => Number(String(s).replace(/,/g, ""));
  const maxExtraRows = otherExpenseItems.length;
  const canAddRow = maxExtraRows > 0 && rows.length < maxExtraRows;

  const confirmEnabled =
    maxExtraRows > 0 &&
    rows.some(
      r =>
        r.sourceOtherId &&
        resolveSource(r.sourceOtherId) &&
        parseCost(r.costUnit) > 0,
    );

  const outlineField = "rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] bg-white";

  const ChevronDown = () => (
    <div data-property-1="down b" className="w-6 h-6 relative shrink-0 flex items-center justify-center pointer-events-none">
      <svg className="w-3.5 h-2 text-[#2a2a2a]" viewBox="0 0 14 8" fill="currentColor" aria-hidden>
        <path d="M0 0L7 8L14 0H0Z"/>
      </svg>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4 font-['IBM_Plex_Sans_Thai']"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[800px] max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-extra-advance-title"
      >
        <div data-property-1="Add extra advance" className="inline-flex flex-col justify-start items-start gap-2.5 w-full">
          <div className="bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start overflow-hidden w-full">
            <div
              data-property-1="Default"
              className="self-stretch pl-12 pr-6 pt-6 pb-3 bg-white inline-flex justify-center items-start gap-2.5"
            >
              <div className="flex-1 inline-flex flex-col justify-start items-center gap-3 min-w-0">
                <div
                  id="add-extra-advance-title"
                  className="self-stretch text-center justify-start text-[#142b41] text-lg font-semibold leading-7 tracking-tight"
                >
                  Add Extra Advance
                </div>
                <div className="w-[210px] h-0 outline-4 -outline-offset-2 outline-[#97bee4]" />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิด"
                className="w-6 h-6 relative overflow-hidden shrink-0 flex items-center justify-center text-[#2a2a2a] hover:opacity-70 mt-0.5"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col justify-start items-start gap-3 overflow-y-auto max-h-[min(55vh,480px)] w-full">
              {otherExpenseItems.length === 0 && (
                <p className="text-sm text-[#676363] w-full">ยังไม่มีรายการ Other Expense</p>
              )}
              {rows.map(row => {
                const src = resolveSource(row.sourceOtherId);
                const takenByOtherRows = new Set(
                  rows.filter(r => r.id !== row.id && r.sourceOtherId).map(r => r.sourceOtherId),
                );
                return (
                  <div
                    key={row.id}
                    className="self-stretch inline-flex flex-wrap justify-start items-center gap-x-6 gap-y-3 w-full"
                  >
                    <div className="w-[210px] min-w-[140px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="inline-flex justify-start items-start gap-1">
                        <div className="flex justify-start items-start gap-1">
                          <div className="justify-start text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">
                            Items
                          </div>
                        </div>
                      </div>
                      <div className={`self-stretch min-h-10 px-3 py-2 inline-flex justify-start items-center gap-2 ${outlineField}`}>
                        <select
                          value={row.sourceOtherId}
                          onChange={e => {
                            const oid = e.target.value;
                            const s = resolveSource(oid);
                            updateRow(row.id, {
                              sourceOtherId: oid,
                              costUnit: s ? formatCostUnitForInput(s.costUnit) : "0.00",
                            });
                          }}
                          disabled={otherExpenseItems.length === 0}
                          aria-label="Items"
                          className={`flex-1 min-w-0 appearance-none bg-transparent text-base font-normal leading-6 tracking-tight outline-none border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                            row.sourceOtherId ? "text-[#2a2a2a]" : "text-[#b9b9b9]"
                          }`}
                        >
                          <option value="">Please select</option>
                          {otherExpenseItems.map(o => (
                            <option key={o.id} value={o.id} disabled={takenByOtherRows.has(o.id)}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown />
                      </div>
                    </div>

                    <div className="w-40 min-w-[120px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="inline-flex justify-start items-start gap-1">
                        <div className="flex justify-start items-start gap-1">
                          <div className="justify-start text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">
                            Remark
                          </div>
                        </div>
                      </div>
                      <div className={`self-stretch min-h-10 px-3 py-2 inline-flex justify-start items-center gap-2 ${outlineField}`}>
                        <input
                          type="text"
                          placeholder="Please enter"
                          value={row.remark}
                          onChange={e => updateRow(row.id, { remark: e.target.value })}
                          className="flex-1 min-w-0 bg-transparent text-base font-normal leading-6 tracking-tight placeholder:text-[#b9b9b9] text-[#2a2a2a] outline-none border-0"
                        />
                      </div>
                    </div>

                    <div className="w-40 min-w-[120px] inline-flex flex-col justify-center items-start gap-1">
                      <div className="inline-flex justify-start items-start gap-1">
                        <div className="justify-start text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">
                          Cost Type
                        </div>
                      </div>
                      <div
                        className={`self-stretch h-10 px-3 py-1 inline-flex justify-start items-center gap-2 ${outlineField}`}
                        title={src ? "อ้างอิงจาก Other Expense" : ""}
                      >
                        <div
                          className={`flex-1 justify-start text-base font-normal leading-6 tracking-tight ${
                            src ? "text-[#2a2a2a]" : "text-[#b9b9b9]"
                          }`}
                        >
                          {src ? src.costType : "—"}
                        </div>
                        <ChevronDown />
                      </div>
                    </div>

                    <div className="w-[150px] min-w-[120px] inline-flex flex-col justify-start items-start gap-1">
                      <div className="inline-flex justify-start items-start gap-1">
                        <div className="justify-start text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">
                          Cost (THB)
                        </div>
                      </div>
                      <div className={`self-stretch h-10 px-3 py-1 inline-flex justify-start items-center gap-2 ${outlineField}`}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.costUnit}
                          onChange={e => updateRow(row.id, { costUnit: e.target.value })}
                          disabled={!src}
                          placeholder="0.00"
                          title={src ? "แก้ไขได้ (ค่าเริ่มจาก Other Expense)" : "เลือก Items ก่อน"}
                          className={`flex-1 min-w-0 bg-transparent text-base font-normal leading-6 tracking-tight outline-none border-0 text-right ${
                            src ? "text-[#2a2a2a]" : "text-[#b9b9b9]"
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                data-button-color="Blue Secondary"
                data-button-size="Size 32"
                data-button-state="Outline"
                onClick={() => onRowsChange(prev => [...prev, createEmptyExtraModalRow()])}
                disabled={!canAddRow}
                title={!canAddRow && maxExtraRows > 0 ? `เพิ่มได้สูงสุด ${maxExtraRows} แถว (เท่าจำนวน Other Expense)` : undefined}
                className="py-1 rounded-[100px] inline-flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex justify-center items-center gap-2">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5} aria-hidden>
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                  <div className="flex justify-center items-center gap-2.5">
                    <div className="text-center justify-center text-[#265ed6] text-sm font-medium leading-5 tracking-tight">
                      Add Item
                      {maxExtraRows > 0 ? (
                        <span className="text-xs font-normal text-[#676363] ml-1">({rows.length}/{maxExtraRows})</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="self-stretch p-6 bg-[#f8f8f8] inline-flex justify-end items-center gap-2.5 overflow-hidden w-full">
              <div className="flex-1 flex justify-end items-start gap-2.5 flex-wrap">
                <div className="flex justify-end items-center gap-4">
                  <button
                    type="button"
                    data-button-color="Blue Primary"
                    data-button-size="Size 40"
                    data-button-state="Outline"
                    onClick={onClose}
                    className="px-5 py-2 bg-white rounded-[100px] outline-1 -outline-offset-1 outline-[#265ed6] flex justify-center items-center gap-2 hover:bg-blue-50/40"
                  >
                    <div className="flex justify-center items-end gap-2">
                      <div className="inline-flex flex-col justify-center items-center gap-2.5">
                        <div className="inline-flex justify-center items-center gap-2.5">
                          <div className="text-center justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">
                            Cancel
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <button
                    type="button"
                    data-button-color="Blue Primary"
                    data-button-state={confirmEnabled ? "Default" : "Disable"}
                    disabled={!confirmEnabled}
                    onClick={onConfirm}
                    className={`px-5 py-2 rounded-[100px] flex justify-center items-center gap-2 ${
                      confirmEnabled
                        ? "bg-[#265ed6] outline-1 -outline-offset-1 outline-[#265ed6] hover:bg-[#1f4fc4]"
                        : "bg-[#e5e5e5] cursor-not-allowed"
                    }`}
                  >
                    <div className="flex justify-center items-end gap-2">
                      <div className="flex justify-center items-center gap-2.5">
                        <div
                          className={`text-center justify-start text-base font-medium leading-6 tracking-tight ${
                            confirmEnabled ? "text-white" : "text-[#a3a3a3]"
                          }`}
                        >
                          Confirm
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function splitAdvanceItemName(name: string): { headline: string; remark: string | null } {
  const sep = " — ";
  const idx = name.indexOf(sep);
  if (idx === -1) return { headline: name, remark: null };
  return { headline: name.slice(0, idx), remark: name.slice(idx + sep.length) };
}

type ExtraAdvanceTableVariant = "view" | "edit";

function ExtraAdvanceIconDocPlus() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" strokeLinejoin="round"/>
      <path d="M14 2v6h6"/>
      <path d="M12 18v-6M9 15h6" strokeLinecap="round"/>
    </svg>
  );
}

function AttachmentPaperclipIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function AttachmentAddSlipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-[100px] border border-[#265ed6] bg-white px-5 py-2 text-base font-medium leading-6 tracking-tight text-[#265ed6] hover:bg-blue-50/60 transition-colors"
    >
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#265ed6]" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      Add Slip
    </button>
  );
}

/** ตาราง Extra Advance — โครงสร้างตามดีไซน์ (หัวคอลัมน์ Extra Advance สีส้ม, Total สีส้ม, ปุ่มลบ) */
function ExtraAdvanceDeleteIconButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-6 h-6 p-1 rounded-full outline-1 -outline-offset-1 outline-[#ff3b3b] flex justify-center items-center hover:bg-red-50 shrink-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d91616" strokeWidth={1.5} className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.008 0L9.26 9M19.5 9.75l-.005-.25a48.11 48.11 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3h7.5l1.125 2.25H21M4.5 7.5h15m-13.125 0 1.32 13.155a1.125 1.125 0 0 0 1.122 1.02h6.166a1.125 1.125 0 0 0 1.122-1.02L17.625 7.5" />
      </svg>
    </button>
  );
}

function ExtraAdvanceTable({
  seedExtra,
  modalExtra,
  variant,
  onRemoveModal,
  onRemoveSeed,
  onEditSeedCostUnit,
  onEditSeedPax,
  onEditSeedAdvCost,
  onEditModalCostUnit,
  onEditModalPax,
  onEditModalAdvCost,
}: {
  seedExtra: AdvanceItem[];
  modalExtra: ExtraAdvanceItem[];
  variant: ExtraAdvanceTableVariant;
  onRemoveModal?: (id: string) => void;
  /** ลบ/ถอนรายการจาก seed (sections.extra) ออกจากตาราง */
  onRemoveSeed?: (id: string) => void;
  onEditSeedCostUnit?: (id: string, val: string) => void;
  onEditSeedPax?: (id: string, val: string) => void;
  onEditSeedAdvCost?: (id: string, val: string) => void;
  onEditModalCostUnit?: (id: string, val: string) => void;
  onEditModalPax?: (id: string, val: string) => void;
  onEditModalAdvCost?: (id: string, val: string) => void;
}) {
  const rows: { item: AdvanceItem | ExtraAdvanceItem; fromModal: boolean }[] = [
    ...seedExtra.filter(i => i.checked).map(item => ({ item, fromModal: false as const })),
    ...modalExtra.filter(i => i.checked).map(item => ({ item, fromModal: true as const })),
  ];
  const total = rows.reduce((s, r) => s + (r.item.advCost || 0), 0);
  const formatMoney0 = (v: number) =>
    `${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const inputMoney = (v: number) => Number(v || 0).toFixed(2);
  const getCostTypeLabel = (i: AdvanceItem | ExtraAdvanceItem) =>
    i.costType === "Fix" ? `Fix (0 - ${i.pax} Pax)` : i.costType;

  const cellOutline = "rounded outline-1 -outline-offset-1 outline-[#d9d9d9] bg-white";

  const rowName = (i: AdvanceItem | ExtraAdvanceItem) => {
    const { headline, remark } = splitAdvanceItemName(i.name);
    return (
      <>
        <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
          {headline}
        </div>
        <div className="justify-start text-[#676363] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
          {remark ? `Remark : ${remark}` : "Remark : "}
        </div>
      </>
    );
  };

  if (rows.length === 0) {
    return (
      <div className="px-5 py-6 text-center text-gray-400 text-sm font-['IBM_Plex_Sans_Thai']">ไม่มีรายการ</div>
    );
  }

  const isView = variant === "view";
  const idxColClass = isView ? "w-12" : "w-16";

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full font-['IBM_Plex_Sans_Thai']">
      <div className="self-stretch rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start overflow-hidden">
        <div className="self-stretch rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start overflow-hidden">
          <div className="self-stretch bg-white rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
                <div className={`${idxColClass} h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden shrink-0`}>
                  {isView ? (
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                  ) : (
                    <div className="w-[34px] flex justify-start items-center gap-1">
                      <input
                        type="checkbox"
                        readOnly
                        checked
                        aria-hidden
                        className="w-5 h-5 rounded border-0 accent-[#265ed6] shrink-0 cursor-default"
                      />
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                    </div>
                  )}
                </div>
                <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden min-w-0">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Items</div>
                </div>
                <div className="w-[150px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden shrink-0">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Option</div>
                </div>
                <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden shrink-0">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div>
                </div>
                <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden shrink-0">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost (Unit)</div>
                </div>
                <div className="w-20 h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden shrink-0">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Pax</div>
                </div>
                <div className={`w-[162px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden shrink-0 ${isView ? "rounded-tr-lg" : ""}`}>
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Extra Advance</div>
                </div>
                {!isView && <div className="w-10 h-11 p-2 bg-[#142b41] shrink-0" />}
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start">
              {rows.map(({ item: i, fromModal }, idx) => (
                <div key={i.id} className="self-stretch inline-flex justify-start items-stretch min-h-[62px]">
                  <div className={`${idxColClass} min-h-[62px] p-2 bg-white flex justify-center items-center gap-1 overflow-hidden shrink-0`}>
                    {isView ? (
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                        {idx + 1}
                      </div>
                    ) : (
                      <div className="w-[34px] flex justify-start items-center gap-1">
                        <input
                          type="checkbox"
                          readOnly
                          checked={i.checked}
                          aria-label={`เลือกแถว ${idx + 1}`}
                          className="w-5 h-5 rounded border-0 accent-[#265ed6] shrink-0 cursor-default"
                        />
                        <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{idx + 1}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-h-[62px] min-w-0 p-2 bg-white border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1">
                    {rowName(i)}
                  </div>
                  <div className="w-[150px] min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-start items-center shrink-0">
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">-</div>
                  </div>
                  <div className="w-[120px] min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-start items-center shrink-0">
                    <div className="max-w-full truncate justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight" title={getCostTypeLabel(i)}>
                      {getCostTypeLabel(i)}
                    </div>
                  </div>
                  <div className="w-[120px] min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center shrink-0">
                    <div className="flex-1 w-full min-w-0 inline-flex flex-col justify-center items-end gap-1">
                      {variant === "edit" && (fromModal ? onEditModalCostUnit : onEditSeedCostUnit) ? (
                        <input
                          value={inputMoney(i.costUnit)}
                          onChange={e =>
                            (fromModal ? onEditModalCostUnit! : onEditSeedCostUnit!)(i.id, e.target.value)
                          }
                          className={`self-stretch px-3 py-2 w-full min-w-0 ${cellOutline} text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight outline-none`}
                        />
                      ) : isView ? (
                        <div className="w-full text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                          {formatMoney0(i.costUnit)}
                        </div>
                      ) : (
                        <div className={`self-stretch px-3 py-2 w-full ${cellOutline} inline-flex justify-end items-center`}>
                          <div className="text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                            {formatMoney0(i.costUnit)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-20 min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center shrink-0">
                    <div className="flex-1 w-full min-w-0 inline-flex flex-col justify-center items-end gap-1">
                      {variant === "edit" && (fromModal ? onEditModalPax : onEditSeedPax) ? (
                        <input
                          type="number"
                          value={i.pax}
                          onChange={e =>
                            (fromModal ? onEditModalPax! : onEditSeedPax!)(i.id, e.target.value)
                          }
                          className={`self-stretch px-3 py-2 w-full min-w-0 ${cellOutline} text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight outline-none`}
                        />
                      ) : isView ? (
                        <div className="w-full text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                          {i.pax}
                        </div>
                      ) : (
                        <div className={`self-stretch px-3 py-2 w-full ${cellOutline} inline-flex justify-end items-center`}>
                          <div className="text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                            {i.pax}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-[162px] min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center shrink-0">
                    <div className="flex-1 w-full min-w-0 inline-flex flex-col justify-center items-end gap-1">
                      {variant === "edit" && (fromModal ? onEditModalAdvCost : onEditSeedAdvCost) ? (
                        <input
                          value={inputMoney(i.advCost || 0)}
                          onChange={e =>
                            (fromModal ? onEditModalAdvCost! : onEditSeedAdvCost!)(i.id, e.target.value)
                          }
                          className={`self-stretch px-3 py-2 w-full min-w-0 ${cellOutline} text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight outline-none`}
                        />
                      ) : isView ? (
                        <div className="w-full text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                          {formatMoney0(i.advCost || 0)}
                        </div>
                      ) : (
                        <div className={`self-stretch px-3 py-2 w-full ${cellOutline} inline-flex justify-end items-center`}>
                          <div className="text-right text-[#2a2a2a] text-base font-normal leading-6 tracking-tight tabular-nums">
                            {formatMoney0(i.advCost || 0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isView && (
                    <div className="min-h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-center items-center w-10 shrink-0">
                      {fromModal && onRemoveModal ? (
                        <ExtraAdvanceDeleteIconButton onClick={() => onRemoveModal(i.id)} label="ลบรายการ Extra Advance" />
                      ) : !fromModal && onRemoveSeed ? (
                        <ExtraAdvanceDeleteIconButton onClick={() => onRemoveSeed(i.id)} label="นำรายการออกจากตาราง" />
                      ) : (
                        <span className="w-6 h-6 inline-block" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="self-stretch inline-flex justify-start items-stretch bg-white border-t border-[#d9d9d9]">
              <div className={`flex-1 min-h-12 relative ${isView ? "rounded-bl-lg" : ""}`}>
                <div className="absolute left-[15px] top-3 text-[#265ed6] text-base font-medium leading-6 tracking-tight">
                  Total
                </div>
              </div>
              <div className={`w-[162px] px-[15px] py-3 flex justify-end items-center shrink-0 ${isView ? "rounded-br-lg" : ""}`}>
                <div className="text-right text-[#fd5c04] text-base font-medium leading-6 tracking-tight">
                  {formatMoney0(total)}
                </div>
              </div>
              {!isView && <div className="w-10 min-w-10 shrink-0 rounded-br-lg" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SINGLE SECTION VIEW TABLE ────────────────────────────────────────────────
function SectionViewTable({ sectionKey, items, extraItems = [], onRemoveExtra }: {
  sectionKey: SectionKey;
  items: AdvanceSections[SectionKey];
  extraItems?: ExtraAdvanceItem[];
  onRemoveExtra?: (id: string) => void;
}) {
  const COLS = ["#", "Items", "Remark", "Option", "Cost Type", "Cost (Unit)", "Pax", "Adv.Cost"];
  const mergedExtra = sectionKey === "extra" ? extraItems.filter(i => i.checked) : [];
  const checked = [...items.filter(i => i.checked), ...mergedExtra];
  const extraIds = new Set(extraItems.map(i => i.id));
  const total   = checked.reduce((s, i) => s + i.advCost, 0);
  const getCostTypeLabel = (item: AdvanceItem | ExtraAdvanceItem) =>
    item.costType === "Fix" ? `Fix (10 - ${item.pax} Pax)` : item.costType;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#1e2a3a]">
            {COLS.map(h => (
              <th key={h} className={`px-4 py-3 text-left text-xs font-semibold whitespace-nowrap ${
                h === "Pax" || h === "Adv.Cost" ? "text-[#60ADFF]" : "text-gray-300"
              }`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checked.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">ไม่มีรายการ</td></tr>
          )}
          {checked.map((item, iline) => {
            const { headline, remark } = splitAdvanceItemName(item.name);
            return (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-3 text-gray-400 text-xs">{iline + 1}</td>
              <td className="px-4 py-3 text-gray-700">{headline}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{remark ?? "-"}</td>
              <td className="px-4 py-3 text-gray-400">
                {sectionKey === "extra" && extraIds.has(item.id) && onRemoveExtra ? (
                  <button
                    type="button"
                    onClick={() => onRemoveExtra(item.id)}
                    className="text-[#DC2626] hover:text-[#B91C1C] text-xs font-medium"
                  >
                    ลบ
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-[#2a2a2a]">
                <div className="max-w-[180px] truncate" title={getCostTypeLabel(item)}>
                  {getCostTypeLabel(item)}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">฿{item.costUnit.toLocaleString()}.00</td>
              <td className="px-4 py-3 text-gray-700">{item.pax}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">{item.advCost.toLocaleString()}.00</td>
            </tr>
            );
          })}
        </tbody>
        {checked.length > 0 && (
          <tfoot>
            <tr className="border-t border-gray-100">
              <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-blue-600">Total</td>
              <td className="px-4 py-3 text-sm font-bold text-blue-600">{total.toLocaleString()}.00</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ─── PENDING SECTION VIEW TABLE (ให้หน้าตรงตามดีไซน์ View Pending) ─────────────
function PendingSectionViewTable({
  sectionKey,
  items,
}: {
  sectionKey: SectionKey;
  items: AdvanceItem[];
}) {
  const checked = items.filter((i) => i.checked);
  const total = checked.reduce((s, i) => s + (i.advCost || 0), 0);
  const isOther = sectionKey === "other";

  const formatMoney0 = (v: number) => `${v.toLocaleString()}.00`;
  const getCostTypeLabel = (i: AdvanceItem | ExtraAdvanceItem) =>
    i.costType === "Fix" ? `Fix (0 - ${i.pax} Pax)` : i.costType;

  const headerNameLabel = isOther
    ? "Items"
    : sectionKey === "guide"
      ? "Guide Items"
      : sectionKey === "vehicle"
        ? "Vehicle"
        : "Items";

  const rowNameOtherLike = (i: AdvanceItem | ExtraAdvanceItem) => {
    const { headline, remark } = splitAdvanceItemName(i.name);
    return (
      <div className="inline-flex justify-start items-start flex-col gap-1">
        <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
          {headline}
        </div>
        <div className="justify-start text-[#676363] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
          {remark ? `Remark : ${remark}` : "Remark :"}
        </div>
      </div>
    );
  };

  if (checked.length === 0) {
    return (
      <div className="px-5 py-6 text-center text-gray-400 text-sm">ไม่มีรายการ</div>
    );
  }

  return (
    <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden bg-white">
      <div className="self-stretch bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
            <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden">
              <div className="w-[34px] flex justify-start items-center gap-1">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  #
                </div>
              </div>
            </div>

            <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
              <div className="flex justify-start items-center gap-2">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  {headerNameLabel}
                </div>
              </div>
            </div>

            {isOther && (
              <div className="w-[150px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    Option
                  </div>
                </div>
              </div>
            )}

            <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
              <div className="flex justify-start items-center gap-2">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Cost Type
                </div>
              </div>
            </div>

            <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
              <div className="flex justify-start items-center gap-2">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Cost (Unit)
                </div>
              </div>
            </div>

            <div className="w-20 h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
              <div className="flex justify-start items-center gap-2">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Pax
                </div>
              </div>
            </div>

            <div className="w-[162px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
              <div className="flex justify-start items-center gap-2">
                <div className="justify-start text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Advance Cost
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch flex flex-col justify-start items-start">
        {checked.map((i, idx) => {
          const rowBg = idx % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
          return (
            <div key={i.id} className="self-stretch inline-flex justify-start items-start">
              <div className={`w-16 h-14 p-2 ${rowBg} flex justify-center items-center gap-1 overflow-hidden`}>
                <div className="w-[34px] flex justify-start items-center gap-1">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    {idx + 1}
                  </div>
                </div>
              </div>

              <div
                className={`flex-1 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex ${
                  isOther ? "flex-col justify-center items-start" : "justify-start items-center"
                } gap-2.5 overflow-hidden`}
              >
                {isOther ? (
                  <div className="p-0">{rowNameOtherLike(i)}</div>
                ) : (
                  <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    {i.name}
                  </div>
                )}
              </div>

              {isOther && (
                <div className={`w-[150px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                  <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    -
                  </div>
                </div>
              )}

              <div className={`w-[120px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                <div
                  className="max-w-full truncate justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                  title={getCostTypeLabel(i)}
                >
                  {getCostTypeLabel(i)}
                </div>
              </div>

              <div className={`w-[120px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  {formatMoney0(i.costUnit)}
                </div>
              </div>

              <div className={`w-20 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  {i.pax}
                </div>
              </div>

              <div className={`w-[162px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  {formatMoney0(i.advCost || 0)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="self-stretch inline-flex justify-start items-start">
        <div className="w-[886px] h-12 relative bg-white border-t border-[#d9d9d9] flex items-center">
          <div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
            Total
          </div>
        </div>
        <div className="flex-1 px-[15px] py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
          <div className="text-right justify-start text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight whitespace-nowrap">
            ฿{formatMoney0(total)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingSectionEditTable({
  sectionKey,
  items,
  onSetCostUnit,
  onSetPax,
  onSetAdvCost,
}: {
  sectionKey: SectionKey;
  items: AdvanceSections[typeof sectionKey];
  onSetCostUnit: (id: string, val: string) => void;
  onSetPax: (id: string, val: string) => void;
  onSetAdvCost: (id: string, val: string) => void;
}) {
  const checked = items.filter((i) => i.checked);
  const total = checked.reduce((s, i) => s + (i.advCost || 0), 0);
  const isOther = sectionKey === "other";
  const formatMoney0 = (v: number) => `${v.toLocaleString()}.00`;
  const getCostTypeLabel = (i: AdvanceItem | ExtraAdvanceItem) =>
    i.costType === "Fix" ? `Fix (0 - ${i.pax} Pax)` : i.costType;
  const headerNameLabel = isOther
    ? "Items"
    : sectionKey === "guide"
      ? "Guide Items"
      : sectionKey === "vehicle"
        ? "Vehicle"
        : "Items";

  if (checked.length === 0) {
    return <div className="px-5 py-6 text-center text-gray-400 text-sm">ไม่มีรายการ</div>;
  }

  return (
    <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden bg-white">
      <div className="self-stretch bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
            <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden"><div className="text-white text-base">#</div></div>
            <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center text-white text-base">{headerNameLabel}</div>
            {isOther && <div className="w-[150px] h-11 p-2 bg-[#142b41] border-l border-white flex items-center text-white text-base">Option</div>}
            <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex items-center text-white text-base">Cost Type</div>
            <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center text-white text-base">Cost (Unit)</div>
            <div className="w-20 h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center text-white text-base">Pax</div>
            <div className="w-[162px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center text-white text-base">Advance Cost</div>
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start">
        {checked.map((i, idx) => {
          const rowBg = idx % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
          return (
            <div key={i.id} className="self-stretch inline-flex justify-start items-start">
              <div className={`w-16 h-14 p-2 ${rowBg} flex justify-center items-center overflow-hidden`}><div className="text-[#2a2a2a] text-base">{idx + 1}</div></div>
              <div className={`flex-1 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex ${isOther ? "flex-col justify-center items-start" : "justify-start items-center"} overflow-hidden`}>
                {isOther ? <><div className="text-[#2a2a2a] text-base">{i.name}</div><div className="text-[#676363] text-xs">Remark :</div></> : <div className="text-[#2a2a2a] text-base">{i.name}</div>}
              </div>
              {isOther && <div className={`w-[150px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex items-center`}>-</div>}
              <div className={`w-[120px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex items-center`}>
                <div className="max-w-full truncate text-[#2a2a2a] text-base" title={getCostTypeLabel(i)}>{getCostTypeLabel(i)}</div>
              </div>
              <div className={`w-[120px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                <input value={i.costUnit} onChange={(e) => onSetCostUnit(i.id, e.target.value)} className="w-full px-3 py-2 bg-white rounded outline outline-[#d9d9d9] text-right text-[#2a2a2a] text-base" />
              </div>
              <div className={`w-20 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                <input value={i.pax} onChange={(e) => onSetPax(i.id, e.target.value)} className="w-full px-3 py-2 bg-white rounded outline outline-[#d9d9d9] text-right text-[#2a2a2a] text-base" />
              </div>
              <div className={`w-[162px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                <input value={i.advCost} onChange={(e) => onSetAdvCost(i.id, e.target.value)} className="w-full px-3 py-2 bg-white rounded outline outline-[#d9d9d9] text-right text-[#2a2a2a] text-base" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="self-stretch inline-flex justify-start items-start">
        <div className="w-[886px] h-12 relative bg-white border-t border-[#d9d9d9] flex items-center"><div className="left-[15px] top-[12px] absolute text-[#265ed6] text-base">Total</div></div>
        <div className="flex-1 px-[15px] py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center"><div className="text-[#265ed6] text-base">฿{formatMoney0(total)}</div></div>
      </div>
    </div>
  );
}

// ─── EDIT TABLE ───────────────────────────────────────────────────────────────
interface EditTableProps {
  sections: AdvanceSections;
  extraItems: ExtraAdvanceItem[];
  onToggle: (sec: SectionKey, id: string) => void;
  onSetActPax: (sec: SectionKey, id: string, val: string) => void;
  onSetActCost: (sec: SectionKey, id: string, val: string) => void;
}
function EditTable({ sections, extraItems, onToggle, onSetActPax, onSetActCost }: EditTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 40 }} /><col /><col style={{ width: 86 }} />
          <col style={{ width: 50 }} /><col style={{ width: 100 }} />
          <col style={{ width: 110 }} /><col style={{ width: 86 }} /><col style={{ width: 106 }} />
        </colgroup>
        <thead>
          <tr className="bg-[#1e2a3a]">
            {["","รายการ","Cost Type","Pax","Cost/Unit","Adv.Cost","Act.Pax ✎","Act.Cost ✎"].map((h,i) => (
              <th key={i} className={`px-3 py-3 text-left text-xs font-semibold whitespace-nowrap ${
                h.includes("Adv") ? "text-[#60ADFF]" : h.includes("Act") ? "text-blue-300" : "text-gray-300"
              }`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(Object.entries(sections) as [SectionKey, AdvanceSections[SectionKey]][]).map(([key, items]) => {
            const m = SEC[key];
            return [
              <tr key={`hdr-${key}`} style={{ background: m.bg }}>
                <td colSpan={8} style={{ padding: "9px 16px", borderTop: `1px solid ${m.border}`, borderBottom: `1px solid ${m.border}` }}>
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.icon} {m.label}</span>
                </td>
              </tr>,
              ...items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 bg-white" style={{ opacity: item.checked ? 1 : 0.4 }}>
                  <td className="px-3 py-2 text-center align-middle">
                    <input type="checkbox" checked={item.checked} onChange={() => onToggle(key, item.id)}
                      style={{ accentColor: m.accent, width: 15, height: 15, cursor: "pointer" }} />
                  </td>
                  <td className="px-3 py-2 text-gray-700 align-middle">{item.name}</td>
                  <td className="px-3 py-2 text-xs text-[#2a2a2a] align-middle">
                    <div className="truncate" title={item.costType}>
                      {item.costType}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600 align-middle">{item.pax}</td>
                  <td className="px-3 py-2 text-right text-gray-600 align-middle">฿{item.costUnit.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700 align-middle">฿{item.advCost.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center align-middle">
                    <input type="number" value={item.actPax} disabled={!item.checked}
                      onChange={e => onSetActPax(key, item.id, e.target.value)}
                      className="rounded-md text-center text-sm font-bold text-blue-700 outline-none w-14 py-1"
                      style={{ border: "1px solid #BFDBFE", background: item.checked ? "#EFF6FF" : "#F8FAFD" }} />
                  </td>
                  <td className="px-2 py-2 text-right align-middle">
                    <input type="number" value={item.actCost} disabled={!item.checked}
                      onChange={e => onSetActCost(key, item.id, e.target.value)}
                      className="rounded-md text-right text-sm outline-none w-24 py-1 px-2"
                      style={{ border: "1px solid #E0E6F0", background: item.checked ? "#fff" : "#F8FAFD" }} />
                  </td>
                </tr>
              )),
              ...(key === "extra"
                ? extraItems.map(item => {
                    const { headline, remark } = splitAdvanceItemName(item.name);
                    return (
                      <tr key={item.id} className="border-b border-amber-100/80 bg-amber-50/40">
                        <td className="px-3 py-2 text-center align-middle">
                          <input type="checkbox" checked readOnly style={{ accentColor: "#D97706", width: 15, height: 15 }} />
                        </td>
                        <td className="px-3 py-2 text-gray-800 align-middle">
                          <div className="text-sm font-medium">{headline}</div>
                          {remark ? <div className="text-xs text-gray-500 mt-0.5">Remark: {remark}</div> : null}
                        </td>
                        <td className="px-3 py-2 text-xs text-[#2a2a2a] align-middle">
                          <div className="truncate" title={item.costType}>
                            {item.costType}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600 align-middle">{item.pax}</td>
                        <td className="px-3 py-2 text-right text-gray-600 align-middle">฿{item.costUnit.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-amber-800 align-middle">฿{item.advCost.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center text-gray-500 text-xs align-middle">{item.actPax}</td>
                        <td className="px-3 py-2 text-right text-gray-600 align-middle">฿{item.actCost.toLocaleString()}</td>
                      </tr>
                    );
                  })
                : []),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdvanceDetailPage({ params }: { params: Promise<{ tripCode: string }> }) {
  const { tripCode } = use(params);
  const router       = useRouter();
  const trip         = INIT_TRIPS.find(t => t.tripCode === tripCode);

  const [mode, setMode]               = useState<PageMode>("view");
  const [sections, setSections]       = useState<AdvanceSections>(trip ? initAdvSections(trip) : { guide:[], vehicle:[], other:[], allowance:[], extra:[] });
  const [extraItems, setExtraItems]   = useState<ExtraAdvanceItem[]>([]);
  const [savedSections, setSavedSections] = useState<AdvanceSections>(trip ? initAdvSections(trip) : { guide:[], vehicle:[], other:[], allowance:[], extra:[] });
  const [savedExtraItems, setSavedExtraItems] = useState<ExtraAdvanceItem[]>([]);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraModalRows, setExtraModalRows] = useState<ExtraModalRow[]>(() => [createEmptyExtraModalRow()]);
  const [approveDialogStep, setApproveDialogStep] = useState<null | "warning" | "success">(null);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [localStatus, setLocalStatus] = useState(trip?.status ?? "Pending");
  const [openSecs, setOpenSecs] = useState<Record<SectionKey, boolean>>({
    guide: true, vehicle: true, other: true, allowance: true, extra: true,
  });
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipPreviewSrc, setSlipPreviewSrc] = useState<string | null>(null);
  const toggleSec = (k: SectionKey) => setOpenSecs(p => ({ ...p, [k]: !p[k] }));

  useLayoutEffect(() => {
    if (!trip) return;
    const st = advanceGetClientTripStatus(trip.tripCode);
    if (st !== undefined) setLocalStatus(st);
    const draft = advanceGetTripAdvanceDraft(trip.tripCode);
    if (draft) {
      setSections(draft.sections);
      setExtraItems(draft.extraItems);
      setSavedSections(draft.sections);
      setSavedExtraItems(draft.extraItems);
    }
    const slipSrc = advanceGetTripSlipPreviewSrc(trip.tripCode);
    setSlipPreviewSrc(slipSrc !== undefined ? slipSrc : null);
  }, [trip]);

  if (!trip) {
    return (
      <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
        <Sidebar /><div className="flex-1 flex flex-col"><Header />
          <main className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
            <div className="text-gray-400">ไม่พบ Trip Code: {tripCode}</div>
          </main><Footer /></div>
      </div>
    );
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const removeExtraItem = (id: string) => {
    setExtraItems(prev => prev.filter(x => x.id !== id));
    showToast("ลบ Extra Advance แล้ว ✓");
  };

  const removeSeedExtraItem = (id: string) => {
    setSections(p => ({
      ...p,
      extra: p.extra.map(i => (i.id === id ? { ...i, checked: false } : i)),
    }));
    showToast("นำรายการออกจากตารางแล้ว ✓");
  };

  const persistListAdvanceTotalsToClient = () => {
    const main = (["guide", "vehicle", "other", "allowance"] as SectionKey[])
      .flatMap(k => sections[k])
      .filter(i => i.checked)
      .reduce((s, i) => s + (i.advCost || 0), 0);
    const extra = [...sections.extra.filter(i => i.checked), ...extraItems.filter(i => i.checked)].reduce(
      (s, i) => s + (i.advCost || 0),
      0,
    );
    advanceSetTripAdvanceTotals(trip.tripCode, main, extra);
    advanceSetTripAdvanceDraft(trip.tripCode, sections, extraItems);
  };

  const handleSave = () => {
    // หน้านี้ใช้ local state เป็นแหล่งข้อมูลหลัก จึงถือว่าบันทึกเมื่อกด Save
    setSavedSections(JSON.parse(JSON.stringify(sections)) as AdvanceSections);
    setSavedExtraItems(JSON.parse(JSON.stringify(extraItems)) as ExtraAdvanceItem[]);
    persistListAdvanceTotalsToClient();
    showToast("บันทึกเรียบร้อย ✓");
    setMode("view");
  };

  const handleEnterEdit = () => {
    // เมื่อเริ่มแก้ไข ให้เอารายการตั้งต้น "ประกันการเดินทาง" ออกจาก Extra Advance
    setSections(p => ({
      ...p,
      extra: p.extra.map(i =>
        i.name.includes("ประกันการเดินทาง") ? { ...i, checked: false } : i,
      ),
    }));
    setMode("edit");
  };

  const handleApproveWarningOk = () => {
    setApproveDialogStep("success");
  };

  /** ปิด Success และยืนยัน Approve จริง → ไปหน้ารายการแท็บ Completed (จำกัดแค่ใน session ก่อนรีเฟรช) */
  const handleApproveSuccessClose = () => {
    setSavedSections(JSON.parse(JSON.stringify(sections)) as AdvanceSections);
    setSavedExtraItems(JSON.parse(JSON.stringify(extraItems)) as ExtraAdvanceItem[]);
    persistListAdvanceTotalsToClient();
    setLocalStatus("Completed");
    setMode("view");
    setApproveDialogStep(null);
    showToast("Approve เรียบร้อย ✓");
    advanceMarkTripStatus(trip.tripCode, "Completed");
    advanceRequestCompletedTab();
    router.push("/payment/advance");
  };

  const toggleItem  = (sec: SectionKey, id: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, checked: !i.checked } : i) }));
  const setActPax   = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id !== id ? i : { ...i, actPax: Number(val), actCost: i.costType === "Person" ? i.costUnit * Number(val) : i.actCost }) }));
  const setActCost  = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, actCost: Number(val) } : i) }));
  const parseMoney = (s: string) => Number(String(s).replace(/,/g, "") || 0);
  const calcAdvanceFromCostType = (costType: CostType, costUnit: number, pax: number) =>
    costType === "Person" ? costUnit * pax : costUnit;
  const calcCostUnitFromAdvance = (costType: CostType, advCost: number, pax: number) =>
    costType === "Person" ? (pax > 0 ? advCost / pax : 0) : advCost;

  const setCostUnit = (sec: SectionKey, id: string, val: string) => {
    const n = parseMoney(val);
    setSections(p => ({
      ...p,
      [sec]: p[sec].map(i => (i.id === id ? { ...i, costUnit: n, advCost: calcAdvanceFromCostType(i.costType, n, i.pax) } : i)),
    }));
  };
  const setPax = (sec: SectionKey, id: string, val: string) => {
    const n = Number(val || 0);
    setSections(p => ({
      ...p,
      [sec]: p[sec].map(i => (i.id === id ? { ...i, pax: n, advCost: calcAdvanceFromCostType(i.costType, i.costUnit, n) } : i)),
    }));
  };
  const setAdvanceCost = (sec: SectionKey, id: string, val: string) => {
    const n = parseMoney(val);
    setSections(p => ({
      ...p,
      [sec]: p[sec].map(i =>
        i.id === id ? { ...i, advCost: n, costUnit: calcCostUnitFromAdvance(i.costType, n, i.pax) } : i,
      ),
    }));
  };

  const setSeedExtraCostUnit = (id: string, val: string) => {
    const n = parseMoney(val);
    setSections(p => ({
      ...p,
      extra: p.extra.map(i => {
        if (i.id !== id) return i;
        return { ...i, costUnit: n, advCost: calcAdvanceFromCostType(i.costType, n, i.pax) };
      }),
    }));
  };
  const setSeedExtraPax = (id: string, val: string) => {
    const n = Number(val || 0);
    setSections(p => ({
      ...p,
      extra: p.extra.map(i => {
        if (i.id !== id) return i;
        return { ...i, pax: n, advCost: calcAdvanceFromCostType(i.costType, i.costUnit, n) };
      }),
    }));
  };
  const setSeedExtraAdvCost = (id: string, val: string) => {
    const n = parseMoney(val);
    setSections(p => ({
      ...p,
      extra: p.extra.map(i =>
        i.id === id ? { ...i, advCost: n, costUnit: calcCostUnitFromAdvance(i.costType, n, i.pax) } : i,
      ),
    }));
  };
  const setModalExtraCostUnit = (id: string, val: string) => {
    const n = parseMoney(val);
    setExtraItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        return { ...i, costUnit: n, advCost: calcAdvanceFromCostType(i.costType, n, i.pax) };
      }),
    );
  };
  const setModalExtraPax = (id: string, val: string) => {
    const n = Number(val || 0);
    setExtraItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        return { ...i, pax: n, advCost: calcAdvanceFromCostType(i.costType, i.costUnit, n) };
      }),
    );
  };
  const setModalExtraAdvCost = (id: string, val: string) => {
    const n = parseMoney(val);
    setExtraItems(prev =>
      prev.map(i => (i.id === id ? { ...i, advCost: n, costUnit: calcCostUnitFromAdvance(i.costType, n, i.pax) } : i)),
    );
  };

  /** View แบบเดียวกับ Pending: การ์ด Cash Advance ราบ — ใช้กับ Completed ด้วย */
  const pendingLikeView = mode === "view" && (localStatus === "Pending" || localStatus === "Completed");
  /** Pending เท่านั้น: สรุปยังไม่รวม allowance / extra ตาม mock เดิม */
  const pendingOnlyView = localStatus === "Pending" && mode === "view";
  const advKeys     = (pendingOnlyView ? ["guide", "vehicle", "other"] : ["guide", "vehicle", "other", "allowance"]) as SectionKey[];
  const mainItems   = advKeys.flatMap(k => savedSections[k]).filter(i => i.checked);
  const totalAdv    = mainItems.reduce((s, i) => s + (i.advCost || 0), 0);
  const totalExtra  = pendingOnlyView
    ? 0
    : [...savedSections.extra.filter(i => i.checked), ...savedExtraItems.filter(i => i.checked)].reduce((s, i) => s + (i.advCost || 0), 0);
  const grandTotal  = totalAdv + totalExtra;
  const statusStyle = STATUS_STYLE[localStatus];
  const bankColor   = PAYMENT_BANK_COLOR[trip.bankName] ?? "#265ed6";
  const extraCostRows = sections.extra.filter(i => i.checked);
  const extraAdvanceRows = extraItems.filter(i => i.checked);
  const hasExtraAdvanceContent = extraAdvanceRows.length > 0;
  const pendingLikeSectionCards = ([
    { key: "guide", title: "Guide" },
    { key: "other", title: "Other Expense" },
    { key: "allowance", title: "Allowance" },
    { key: "extra", title: "Extra Cost" },
  ] as const).filter(({ key }) => sections[key].some((item) => item.checked));
  const accordionSectionCards = ([
    { key: "guide", title: SECTION_LABELS.guide },
    { key: "other", title: SECTION_LABELS.other },
    { key: "allowance", title: SECTION_LABELS.allowance },
    { key: "extra", title: SECTION_LABELS.extra },
  ] as const).filter(({ key }) => sections[key].some((item) => item.checked));
  const hasVehicleSection = sections.vehicle.some((item) => item.checked);
  const topSummaryCards = [
    { label: "Pax No.ADV", value: trip.paxAdv, bg: "#dceeff", stroke: "#265ed6" },
    { label: "Checked In", value: trip.checkedIn, bg: "#e6f3e6", stroke: "#1cb579" },
    { label: "No show", value: trip.noShow, bg: "#ffc3c3", stroke: "#d91616" },
    { label: "Amount Pax Act.", value: trip.checkedIn, bg: "#e6f3e6", stroke: "#007800" },
  ] as const;
  /** Completed ตอน Edit ยังใช้ badge แบบเดียวกับ View (ไม่สลับเป็นแบบ Approved) */
  const usePendingStyleStatusBadge =
    pendingLikeView || (mode === "edit" && localStatus === "Completed");

  const openExtraModal = () => {
    setExtraModalRows([createEmptyExtraModalRow()]);
    setShowExtraModal(true);
  };

  const closeExtraModal = () => {
    setShowExtraModal(false);
    setExtraModalRows([createEmptyExtraModalRow()]);
  };

  const confirmExtraModal = () => {
    const catalog = sections.other;
    const parseCost = (s: string) => Number(String(s).replace(/,/g, ""));
    const valid = extraModalRows.filter(r => {
      if (!r.sourceOtherId || !catalog.some(o => o.id === r.sourceOtherId)) return false;
      return parseCost(r.costUnit) > 0;
    });
    if (valid.length === 0) return;
    const t = Date.now();
    setExtraItems(ex => [
      ...ex,
      ...valid.map((r, i) => {
        const src = catalog.find(o => o.id === r.sourceOtherId)!;
        const unit = parseCost(r.costUnit);
        const name = r.remark.trim() ? `${src.name} — ${r.remark.trim()}` : src.name;
        const advCost = src.costType === "Person" ? unit * src.pax : unit;
        const actCost = src.costType === "Person" ? unit * src.actPax : unit;
        return {
          id: `ex${t}-${i}`,
          name,
          costType: src.costType,
          costUnit: unit,
          pax: src.pax,
          advCost,
          actPax: src.actPax,
          actCost,
          checked: true,
        };
      }),
    ]);
    closeExtraModal();
    showToast("เพิ่ม Extra Advance แล้ว ✓");
  };

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span>Payment</span><span>›</span>
              <Link href="/payment/advance" className="hover:text-blue-500">Advance</Link>
              <span>›</span>
              <span className="font-semibold text-blue-600">{mode === "view" ? "View" : "Edit"}</span>
            </div>
            <div className="flex items-center gap-2">
              {mode === "view" ? (
                <>
                  {/* Export */}
                  <button className="flex items-center gap-2 border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    Export
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => router.push("/payment/advance")}
                    className="border border-[#E7E7E9] rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {/* Edit */}
                  <button
                    onClick={handleEnterEdit}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-6">
            {topSummaryCards.map((card, idx) => (
              <div key={card.label} className="flex-1 px-6 py-3 bg-white rounded-xl inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-start items-start gap-4">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch inline-flex justify-start items-start gap-2">
                        <div className="justify-start text-[#1a1a1a] text-[28px] font-normal font-['Kanit'] leading-10">
                          {card.value}
                        </div>
                      </div>
                      <div className="justify-start text-[#1a1a1a] text-base font-normal font-['Kanit'] leading-6">
                        {card.label}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl flex justify-center items-center gap-2.5" style={{ backgroundColor: card.bg }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                        {idx === 1 ? (
                          <>
                            <rect x="3.5" y="2.75" width="17" height="19" rx="2" stroke={card.stroke} strokeWidth={1.5} />
                            <path d="M9 12H15" stroke={card.stroke} strokeWidth={1.5} strokeLinecap="round" />
                          </>
                        ) : idx === 2 ? (
                          <>
                            <circle cx="12" cy="7" r="4.5" stroke={card.stroke} strokeWidth={1.5} />
                            <path d="M6 21C6.6 17.8 8.7 16 12 16C15.3 16 17.4 17.8 18 21" stroke={card.stroke} strokeWidth={1.5} strokeLinecap="round" />
                            <circle cx="18" cy="18" r="1.4" stroke={card.stroke} strokeWidth={1.5} />
                          </>
                        ) : (
                          <>
                            <circle cx="9.5" cy="6.5" r="4.5" stroke={card.stroke} strokeWidth={1.5} />
                            <circle cx="17.5" cy="8.2" r="2.6" stroke={card.stroke} strokeWidth={1.5} />
                            <path d="M2.8 21C3.7 17.5 6 15.8 9.5 15.8C13 15.8 15.3 17.5 16.2 21" stroke={card.stroke} strokeWidth={1.5} strokeLinecap="round" />
                            <path d="M15.8 18.5C16.2 16.5 17.3 15.4 19.2 15.4" stroke={card.stroke} strokeWidth={1.5} strokeLinecap="round" />
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Trip Info Card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-[#E7E7E9] px-6 py-5">
            {/* Row 1: badges left, status+pax right */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date */}
                <span className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {trip.date}
                </span>
                {/* Time */}
                <span className="inline-flex items-center gap-1.5 border border-green-200 bg-green-50 rounded-full px-3 py-1 text-sm text-green-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {trip.tripRound}
                </span>
                {/* Trip Type */}
                <span className="inline-flex items-center gap-1.5 border border-blue-200 bg-blue-50 rounded-full px-3 py-1 text-sm text-blue-700">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                  {trip.tripType}
                </span>
              </div>
              {/* Status + Pax */}
              <div className="flex items-center gap-3">
                {usePendingStyleStatusBadge ? (
                  <>
                    <div
                      className="self-stretch px-2 py-0.5 rounded-2xl flex justify-center items-center gap-1"
                      style={{ background: localStatus === "Pending" ? "#ffefe6" : statusStyle.bg }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: localStatus === "Pending" ? "#fd5c04" : statusStyle.color }}
                      />
                      <div
                        className="text-center justify-start text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight"
                        style={{ color: localStatus === "Pending" ? "#fd5c04" : statusStyle.color }}
                      >
                        {localStatus}
                      </div>
                    </div>
                    <div className="self-stretch px-2 py-1 bg-[#f8f8f8] rounded-[30px] inline-flex flex-col justify-center items-center gap-1">
                      <div className="flex justify-center items-center gap-1">
                        <div className="text-right justify-start text-[#142b41] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight whitespace-nowrap">
                          {trip.checkedIn}/{trip.paxAdv}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: statusStyle.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: statusStyle.color }} />
                      {localStatus}
                    </span>
                    <span className="text-sm text-gray-500">
                      <svg className="inline mr-1" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                      {trip.checkedIn}/{trip.paxAdv}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Trip Code */}
            <div className="flex items-center gap-2 mb-3">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/>
              </svg>
              <span className="text-blue-600 font-semibold text-sm">Trip Code No. {trip.tripCode}</span>
            </div>

            {/* Program + Remark */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[110px]">Program name</span>
                <span>:</span>
                <span className="text-gray-800">{trip.program}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[110px]">Remark</span>
                <span>:</span>
                <span className="text-gray-400">-</span>
              </div>
            </div>
            {usePendingStyleStatusBadge && (
              <>
                <div className="h-0 border-t border-[#d9d9d9] mt-5 mb-5" />
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="inline-flex justify-start items-center gap-2">
                    <div className="text-[#265ed6] text-base font-semibold font-['IBM_Plex_Sans_Thai'] leading-6">
                      Guide Information
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="w-[108px] justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      Guide Name
                    </div>
                    <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      :
                    </div>
                    <div className="flex-1 self-stretch flex justify-start items-center">
                      <div className="flex-1 self-stretch justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                        {trip.guide}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="w-[108px] justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      Book Bank
                    </div>
                    <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      :
                    </div>
                    <div className="flex-1 self-stretch flex justify-start items-center gap-3 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: bankColor }}
                      >
                        <div className="text-white text-[10px] font-bold leading-none">฿</div>
                      </div>
                      <div className="flex-1 self-stretch justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight truncate">
                        {trip.bankName} : {trip.bankNo}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Main 2-column layout ────────────────────────────────────────── */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>

            {/* Left column */}
            <div className="flex flex-col gap-4">

              {mode === "view" ? (
                pendingLikeView ? (
                  <div className="self-stretch rounded-bl-2xl rounded-br-2xl inline-flex flex-col justify-start items-center overflow-hidden">
                    {/* Header: Cash Advance */}
                    <div className="self-stretch p-6 bg-white rounded-tl-2xl rounded-tr-2xl border-b border-[#265ed6] flex flex-col justify-start items-start gap-6 overflow-hidden">
                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <path d="M12 11a.01.01 0 0 0 .01 0 .01.01 0 0 0-.01 0Z"/>
                        </svg>
                        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          Cash Advance
                        </div>
                      </div>
                    </div>

                    {/* Tables (อยู่ใต้ wrapper เดียวกัน) */}
                    <div data-property-1="View" data-property-2="True" data-property-3="Cash" className="self-stretch p-6 bg-white flex flex-col justify-center items-start gap-3">
                      {pendingLikeSectionCards.filter((section) => section.key === "guide").map((section) => (
                        <div key={section.key} className="self-stretch">
                          <div className="self-stretch inline-flex justify-start items-center gap-2">
                            <span className="text-[#265ed6] text-lg">{SEC[section.key].icon}</span>
                            <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                              {section.title}
                            </div>
                          </div>
                          <PendingSectionViewTable sectionKey={section.key} items={sections[section.key]} />
                          {(hasVehicleSection || pendingLikeSectionCards.some((item) => item.key !== "guide")) ? <div className="mt-3 self-stretch h-px bg-[#d9d9d9]" /> : null}
                        </div>
                      ))}
                      {hasVehicleSection ? (
                        <div className="self-stretch">
                          <div className="self-stretch inline-flex justify-start items-center gap-2">
                            <span className="text-[#265ed6] text-lg">{SEC.vehicle.icon}</span>
                            <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                              Vehicle Cost
                            </div>
                          </div>
                          <div className="mt-1 text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Own Vehicle Cost</div>
                          <PendingSectionViewTable sectionKey="vehicle" items={sections.vehicle} />
                          {pendingLikeSectionCards.some((section) => section.key !== "guide") ? <div className="mt-3 self-stretch h-px bg-[#d9d9d9]" /> : null}
                        </div>
                      ) : null}
                      {pendingLikeSectionCards.filter((section) => section.key !== "guide").map((section, index, arr) => (
                        <div key={section.key} className="self-stretch">
                          <div className="self-stretch inline-flex justify-start items-center gap-2">
                            <span className="text-[#265ed6] text-lg">{SEC[section.key].icon}</span>
                            <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                              {section.title}
                            </div>
                          </div>
                          <PendingSectionViewTable sectionKey={section.key} items={sections[section.key]} />
                          {index < arr.length - 1 ? <div className="mt-3 self-stretch h-px bg-[#d9d9d9]" /> : null}
                        </div>
                      ))}
                    </div>

                    {localStatus === "Completed" && (
                      <div className="self-stretch p-6 bg-white border-t border-[#E7E7E9] inline-flex flex-col justify-center items-start gap-6 font-['IBM_Plex_Sans_Thai'] rounded-bl-2xl rounded-br-2xl">
                        {extraCostRows.length > 0 ? (
                          <>
                            <div className="self-stretch inline-flex justify-start items-center gap-2">
                              <span className="text-[#265ed6] text-lg">{SEC.extra.icon}</span>
                              <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">
                                Extra Cost
                              </div>
                            </div>
                            <SectionViewTable sectionKey="extra" items={sections.extra} />
                          </>
                        ) : null}
                        {hasExtraAdvanceContent ? (
                          <>
                            {extraCostRows.length > 0 ? <div className="self-stretch h-px bg-[#E7E7E9]" /> : null}
                            <div className="self-stretch inline-flex justify-start items-center gap-2">
                              <ExtraAdvanceIconDocPlus />
                              <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">
                                Extra Advance
                              </div>
                            </div>
                            <ExtraAdvanceTable
                              seedExtra={[]}
                              modalExtra={extraItems}
                              variant="view"
                            />
                          </>
                        ) : null}

                        <div
                          data-property-1={slipPreviewSrc ? "View After" : "View Before"}
                          data-property-2="True"
                          data-property-3="Cash"
                          className={`self-stretch bg-white flex flex-col justify-center items-start gap-3 ${
                            hasExtraAdvanceContent || extraCostRows.length > 0 ? "pt-6 border-t border-[#E7E7E9]" : ""
                          }`}
                        >
                          <div className="self-stretch inline-flex justify-start items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                              <AttachmentPaperclipIcon />
                            </div>
                            <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                              Attachment
                            </div>
                            <div className="flex justify-end items-center gap-4">
                              <AttachmentAddSlipButton onClick={() => setShowSlipModal(true)} />
                            </div>
                          </div>
                          {slipPreviewSrc ? (
                            <div className="self-stretch inline-flex justify-start items-start gap-6">
                              <div className="inline-flex flex-col justify-center items-start">
                                <img
                                  src={slipPreviewSrc}
                                  alt="สลิปที่แนบ"
                                  className="h-[74.8px] w-[74.8px] rounded-[10px] object-cover outline-2 -outline-offset-2 outline-gray-200"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {accordionSectionCards.filter(({ key }) => key === "guide").map(({ key, title }) => {
                      const m = SEC[key];
                      const isOpen = openSecs[key];
                      const totalCount = sections[key].filter(i => i.checked).length;
                      return (
                        <div key={key} className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleSec(key)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{m.icon}</span>
                              <span className="font-semibold text-sm" style={{ color: m.color }}>{title}</span>
                              <span className="text-xs text-gray-400">({totalCount} รายการ)</span>
                            </div>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}
                              className={`transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}>
                              <path d="M18 15l-6-6-6 6"/>
                            </svg>
                          </button>
                          {isOpen && <SectionViewTable sectionKey={key} items={sections[key]} />}
                        </div>
                      );
                    })}
                    {hasVehicleSection ? (
                      <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleSec("vehicle")}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{SEC.vehicle.icon}</span>
                            <span className="font-semibold text-sm" style={{ color: SEC.vehicle.color }}>
                              Vehicle Cost
                            </span>
                            <span className="text-xs text-gray-400">
                              ({sections.vehicle.filter(i => i.checked).length} รายการ)
                            </span>
                          </div>
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}
                            className={`transition-transform ${openSecs.vehicle ? "rotate-0" : "rotate-180"}`}>
                            <path d="M18 15l-6-6-6 6"/>
                          </svg>
                        </button>
                        {openSecs.vehicle && (
                          <div className="px-5 pt-2 pb-5">
                            <div className="mb-2 text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Own Vehicle Cost</div>
                            <SectionViewTable sectionKey="vehicle" items={sections.vehicle} />
                          </div>
                        )}
                      </div>
                    ) : null}
                    {accordionSectionCards.filter(({ key }) => key !== "guide").map(({ key, title }) => {
                      const m = SEC[key];
                      const isOpen = openSecs[key];
                      const totalCount = sections[key].filter(i => i.checked).length;
                      return (
                        <div key={key} className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleSec(key)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{m.icon}</span>
                              <span className="font-semibold text-sm" style={{ color: m.color }}>
                                {title}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({totalCount} รายการ)
                              </span>
                            </div>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}
                              className={`transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}>
                              <path d="M18 15l-6-6-6 6"/>
                            </svg>
                          </button>
                          {isOpen && (
                            key === "other" ? (
                              <div className="px-5 pb-5">
                                <PendingSectionViewTable sectionKey="other" items={sections.other} />
                              </div>
                            ) : (
                              <SectionViewTable sectionKey={key} items={sections[key]} />
                            )
                          )}
                        </div>
                      );
                    })}

                    {hasExtraAdvanceContent ? (
                      <div
                        data-property-1="Edit"
                        data-property-2="True"
                        data-property-3="Cash"
                        className="self-stretch p-6 bg-white rounded-xl border border-[#E7E7E9] inline-flex flex-col justify-center items-start gap-6 font-['IBM_Plex_Sans_Thai']"
                      >
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <ExtraAdvanceIconDocPlus />
                          <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">
                            Extra Advance
                          </div>
                        </div>
                        <ExtraAdvanceTable
                          seedExtra={[]}
                          modalExtra={extraItems}
                          variant="view"
                          onRemoveModal={removeExtraItem}
                        />
                      </div>
                    ) : null}
                  </>
                )
              ) : (
                <div className="self-stretch rounded-bl-2xl rounded-br-2xl inline-flex flex-col justify-start items-center overflow-hidden">
                  <div className="self-stretch p-6 bg-white rounded-tl-2xl rounded-tr-2xl border-b border-[#265ed6] flex flex-col justify-start items-start gap-6 overflow-hidden">
                    <div className="self-stretch inline-flex justify-start items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <path d="M12 11a.01.01 0 0 0 .01 0 .01.01 0 0 0-.01 0Z"/>
                      </svg>
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                        Cash Advance
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch p-6 bg-white flex flex-col justify-center items-start gap-3">
                    {pendingLikeSectionCards.filter((section) => section.key === "guide").map((section) => (
                      <div key={section.key} className="self-stretch">
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            {section.title}
                          </div>
                        </div>
                        <PendingSectionEditTable
                          sectionKey={section.key}
                          items={sections[section.key]}
                          onSetCostUnit={(id, val) => setCostUnit(section.key, id, val)}
                          onSetPax={(id, val) => setPax(section.key, id, val)}
                          onSetAdvCost={(id, val) => setAdvanceCost(section.key, id, val)}
                        />
                      </div>
                    ))}
                    {hasVehicleSection ? (
                      <div className="self-stretch">
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            Vehicle Cost
                          </div>
                        </div>
                        <div className="mt-1 text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Own Vehicle Cost</div>
                        <PendingSectionEditTable
                          sectionKey="vehicle"
                          items={sections.vehicle}
                          onSetCostUnit={(id, val) => setCostUnit("vehicle", id, val)}
                          onSetPax={(id, val) => setPax("vehicle", id, val)}
                          onSetAdvCost={(id, val) => setAdvanceCost("vehicle", id, val)}
                        />
                      </div>
                    ) : null}
                    {pendingLikeSectionCards.filter((section) => section.key !== "guide").map((section, index) => (
                      <div key={section.key} className="self-stretch">
                        <div className={`self-stretch inline-flex justify-start items-center gap-2 ${index > 0 || hasVehicleSection || pendingLikeSectionCards.some((item) => item.key === "guide") ? "mt-4" : ""}`}>
                          <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            {section.title}
                          </div>
                        </div>
                        <PendingSectionEditTable
                          sectionKey={section.key}
                          items={sections[section.key]}
                          onSetCostUnit={(id, val) => setCostUnit(section.key, id, val)}
                          onSetPax={(id, val) => setPax(section.key, id, val)}
                          onSetAdvCost={(id, val) => setAdvanceCost(section.key, id, val)}
                        />
                      </div>
                    ))}

                    <div
                      data-property-1="Edit"
                      data-property-2="True"
                      data-property-3="Cash"
                      className="self-stretch mt-4 p-6 bg-white rounded-xl border border-[#E7E7E9] inline-flex flex-col justify-center items-start gap-6 font-['IBM_Plex_Sans_Thai']"
                    >
                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <ExtraAdvanceIconDocPlus />
                        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">
                          Extra Advance
                        </div>
                        <div className="flex justify-end items-center gap-4">
                          <button
                            type="button"
                            onClick={openExtraModal}
                            className="px-5 py-2 bg-[#fd5c04] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-95"
                          >
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} aria-hidden>
                              <circle cx="12" cy="12" r="9"/>
                              <path d="M12 8v8M8 12h8"/>
                            </svg>
                            <span className="text-center text-white text-base font-medium leading-6 tracking-tight">
                              Add extra advance
                            </span>
                          </button>
                        </div>
                      </div>
                      <ExtraAdvanceTable
                        seedExtra={[]}
                        modalExtra={extraItems}
                        variant="edit"
                        onRemoveModal={removeExtraItem}
                        onEditModalCostUnit={setModalExtraCostUnit}
                        onEditModalPax={setModalExtraPax}
                        onEditModalAdvCost={setModalExtraAdvCost}
                      />
                    </div>

                    {localStatus === "Completed" ? (
                      <div
                        data-property-1={slipPreviewSrc ? "View After" : "View Before"}
                        data-property-2="True"
                        data-property-3="Cash"
                        className="self-stretch mt-4 flex flex-col justify-center items-start gap-3 border-t border-[#E7E7E9] pt-6"
                      >
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                            <AttachmentPaperclipIcon />
                          </div>
                          <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                            Attachment
                          </div>
                          <div className="flex justify-end items-center gap-4">
                            <AttachmentAddSlipButton onClick={() => setShowSlipModal(true)} />
                          </div>
                        </div>
                        {slipPreviewSrc ? (
                          <div className="self-stretch inline-flex justify-start items-start gap-6">
                            <div className="inline-flex flex-col justify-center items-start">
                              <img
                                src={slipPreviewSrc}
                                alt="สลิปที่แนบ"
                                className="h-[74.8px] w-[74.8px] rounded-[10px] object-cover outline-2 -outline-offset-2 outline-gray-200"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.5}>
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  <p className="text-sm font-bold text-blue-600">Summary</p>
                </div>
                <div className="px-5 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Advance Cost</span>
                    <span className="rounded-lg px-3 py-1 text-sm font-semibold bg-[#dbeafe] text-blue-800">
                      ฿{totalAdv.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Extra Advance</span>
                    <span className="rounded-lg px-3 py-1 text-sm font-semibold bg-[#fef9c3] text-yellow-800">
                      ฿{totalExtra.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Total</span>
                    <span className="text-sm font-bold text-gray-800">
                      ฿{grandTotal.toLocaleString()}.00
                    </span>
                  </div>
                </div>
                {mode === "view" && localStatus !== "Pending" && localStatus !== "Completed" && (
                  <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setApproveDialogStep("warning")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl py-3 transition-colors"
                    >
                      ✓ Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mode === "edit" && (
            <div className="sticky bottom-4 z-30 p-6 bg-white rounded-2xl border border-[#E7E7E9] shadow-[0_8px_24px_rgba(0,0,0,0.08)] inline-flex flex-col justify-center items-end gap-2.5 overflow-hidden">
              <div className="self-stretch inline-flex justify-end items-start gap-2.5">
                <button
                  onClick={() => setMode("view")}
                  className="px-5 py-2 bg-white rounded-[100px] border border-[#265ed6] text-[#265ed6] text-base font-medium leading-6 tracking-tight"
                >
                  Cancel
                </button>
                <div className="flex-1 flex justify-end items-center gap-4">
                  {localStatus !== "Completed" ? (
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-[#e3f1ff] rounded-[100px] inline-flex justify-center items-center gap-2 text-[#265ed6] text-base font-medium leading-6 tracking-tight"
                    >
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                        <path d="M19 21H5a2 2 0 01-2-2V7l4-4h12a2 2 0 012 2v14a2 2 0 01-2 2z"/>
                        <path d="M17 21v-8H7v8M7 3v4h8"/>
                      </svg>
                      Save
                    </button>
                  ) : null}
                  <button
                    onClick={() => setApproveDialogStep("warning")}
                    className="px-5 py-2 bg-[#265ed6] rounded-[100px] inline-flex justify-center items-center gap-2 text-white text-base font-medium leading-6 tracking-tight"
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M8 12.5l2.5 2.5L16 9.5"/>
                    </svg>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <AddExtraAdvanceModal
        open={showExtraModal}
        rows={extraModalRows}
        otherExpenseItems={sections.other}
        onRowsChange={setExtraModalRows}
        onClose={closeExtraModal}
        onConfirm={confirmExtraModal}
      />

      <AttachmentSlipModal
        open={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        trip={trip}
        localStatus={localStatus}
        grandTotal={grandTotal}
        onConfirmSuccess={src => {
          advanceSetTripSlipPreviewSrc(trip.tripCode, src);
          setSlipPreviewSrc(src);
          setShowSlipModal(false);
        }}
      />

      {approveDialogStep === "warning" && (
        <ApproveWarningModal
          onClose={() => setApproveDialogStep(null)}
          onConfirm={handleApproveWarningOk}
        />
      )}
      {approveDialogStep === "success" && (
        <ApproveSuccessModal onClose={handleApproveSuccessClose} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
