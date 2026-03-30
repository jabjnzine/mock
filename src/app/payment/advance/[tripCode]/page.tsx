"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  INIT_TRIPS, SEC, STATUS_STYLE, initAdvSections,
  AdvanceSections, AdvanceItem, ExtraAdvanceItem, SectionKey, CostType,
} from "../../lib/payment-data";

type PageMode = "view" | "edit";

// ─── APPROVE MODAL ────────────────────────────────────────────────────────────
function ApproveModal({ tripCode, program, tripRound, guide, totalAdv, onClose, onConfirm }: {
  tripCode: string; program: string; tripRound: string; guide: string; totalAdv: number;
  onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-7 w-[500px] max-w-[95vw] shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">ยืนยัน Approve</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="text-sm text-gray-600 space-y-1.5 leading-relaxed mb-5">
          <div>Trip Code: <strong>{tripCode}</strong></div>
          <div>Program: <strong>{program}</strong></div>
          <div>Trip Round: <strong>{tripRound}</strong></div>
          <div>Guide: <strong>{guide}</strong></div>
          <div>Total Advance: <strong className="text-blue-700">฿{totalAdv.toLocaleString()}</strong></div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">✅ Approve แล้ว ข้อมูลจะส่งไปยัง Expense</div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">✓ Confirm Approve</button>
        </div>
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

const BANK_COLOR: Record<string, string> = {
  "ธ.กสิกรไทย": "#2BB673",
  "ธ.ไทยพาณิชย์": "#553C9A",
};

const EXTRA_ITEM_PRESETS = [
  "ค่าเข้าชม",
  "ค่าอาหาร",
  "ค่ายานพาหนะเสริม",
  "ค่าประกันการเดินทาง",
  "ค่าซื้อของฝาก / สินค้า",
  "อื่น ๆ",
] as const;

type ExtraModalRow = {
  id: string;
  itemName: string;
  remark: string;
  costType: CostType;
  costUnit: string;
};

function createEmptyExtraModalRow(): ExtraModalRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    itemName: "",
    remark: "",
    costType: "All",
    costUnit: "0.00",
  };
}

function AddExtraAdvanceModal({
  open,
  rows,
  onRowsChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  rows: ExtraModalRow[];
  onRowsChange: (fn: (prev: ExtraModalRow[]) => ExtraModalRow[]) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const updateRow = (id: string, patch: Partial<ExtraModalRow>) =>
    onRowsChange(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const confirmEnabled = rows.some(
    r => r.itemName.trim() && Number(String(r.costUnit).replace(/,/g, "")) > 0,
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[800px] max-h-[90vh] flex flex-col font-['IBM_Plex_Sans_Thai']"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-extra-advance-title"
      >
        <div className="bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
          <div className="self-stretch pl-12 pr-6 pt-6 pb-3 bg-white flex justify-center items-start gap-2.5 relative">
            <div className="flex-1 flex flex-col justify-start items-center gap-3">
              <div id="add-extra-advance-title" className="self-stretch text-center text-[#142b41] text-lg font-semibold leading-7 tracking-tight">
                Add Extra Advance
              </div>
              <div className="w-[210px] h-1 rounded-full bg-[#97bee4]" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิด"
              className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center text-[#2a2a2a] hover:bg-gray-100 rounded-lg"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-6 flex flex-col gap-3 overflow-y-auto">
            {rows.map(row => (
              <div key={row.id} className="self-stretch flex flex-wrap justify-start items-end gap-x-6 gap-y-3">
                <div className="w-[210px] min-w-[140px] flex flex-col gap-1">
                  <label className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Items</label>
                  <div className="relative">
                    <select
                      value={row.itemName}
                      onChange={e => updateRow(row.id, { itemName: e.target.value })}
                      className={`w-full appearance-none h-10 px-3 py-2 pr-9 bg-white rounded-lg border border-[#d9d9d9] text-base leading-6 tracking-tight outline-none focus:border-[#265ed6] ${
                        row.itemName ? "text-[#2a2a2a]" : "text-[#b9b9b9]"
                      }`}
                    >
                      <option value="">Please select</option>
                      {EXTRA_ITEM_PRESETS.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2a2a2a]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5H7z"/>
                    </svg>
                  </div>
                </div>
                <div className="w-40 min-w-[120px] flex flex-col gap-1">
                  <label className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Remark</label>
                  <input
                    type="text"
                    placeholder="Please enter"
                    value={row.remark}
                    onChange={e => updateRow(row.id, { remark: e.target.value })}
                    className="h-10 px-3 py-2 bg-white rounded-lg border border-[#d9d9d9] text-base placeholder:text-[#b9b9b9] outline-none focus:border-[#265ed6]"
                  />
                </div>
                <div className="w-40 min-w-[120px] flex flex-col gap-1">
                  <label className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Cost Type</label>
                  <div className="relative">
                    <select
                      value={row.costType}
                      onChange={e => updateRow(row.id, { costType: e.target.value as CostType })}
                      className="w-full appearance-none h-10 px-3 py-1 pr-9 bg-white rounded-lg border border-[#d9d9d9] text-[#2a2a2a] text-base outline-none focus:border-[#265ed6]"
                    >
                      <option value="All">All</option>
                      <option value="Person">Person</option>
                      <option value="Fix">Fix</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2a2a2a]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5H7z"/>
                    </svg>
                  </div>
                </div>
                <div className="w-[150px] min-w-[120px] flex flex-col gap-1">
                  <label className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Cost (THB)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.costUnit}
                    onChange={e => updateRow(row.id, { costUnit: e.target.value })}
                    className="h-10 px-3 py-1 bg-white rounded-lg border border-[#d9d9d9] text-right text-[#2a2a2a] text-base outline-none focus:border-[#265ed6]"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onRowsChange(prev => [...prev, createEmptyExtraModalRow()])}
              className="py-1 rounded-[100px] inline-flex justify-start items-start gap-2 text-[#265ed6] text-sm font-medium leading-5 hover:opacity-80"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              Add Item
            </button>
          </div>

          <div className="self-stretch p-6 bg-[#f8f8f8] flex justify-end items-center gap-2.5 border-t border-[#ececec]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white rounded-[100px] border border-[#265ed6] text-[#265ed6] text-base font-medium leading-6 tracking-tight hover:bg-blue-50/50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmEnabled}
              onClick={onConfirm}
              className={`px-5 py-2 rounded-[100px] text-base font-medium leading-6 tracking-tight ${
                confirmEnabled
                  ? "bg-[#265ed6] text-white hover:bg-[#1f4fc4]"
                  : "bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SINGLE SECTION VIEW TABLE ────────────────────────────────────────────────
function SectionViewTable({ sectionKey, items, extraItems = [] }: {
  sectionKey: SectionKey;
  items: AdvanceSections[SectionKey];
  extraItems?: ExtraAdvanceItem[];
}) {
  const COLS = ["#", "Items", "Remark", "Option", "Cost Type", "Cost (Unit)", "Pax", "Adv.Cost"];
  const checked = [...items.filter(i => i.checked), ...extraItems.filter(i => i.checked)];
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
          {checked.map((item, i) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
              <td className="px-4 py-3 text-gray-700">{item.name}</td>
              <td className="px-4 py-3 text-gray-400">-</td>
              <td className="px-4 py-3 text-gray-400">-</td>
              <td className="px-4 py-3 text-[#2a2a2a]">
                <div className="max-w-[180px] truncate" title={getCostTypeLabel(item)}>
                  {getCostTypeLabel(item)}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">฿{item.costUnit.toLocaleString()}.00</td>
              <td className="px-4 py-3 text-gray-700">{item.pax}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">{item.advCost.toLocaleString()}.00</td>
            </tr>
          ))}
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
  sectionKey: "guide" | "vehicle" | "other";
  items: AdvanceSections[typeof sectionKey];
}) {
  const checked = items.filter((i) => i.checked);
  const total = checked.reduce((s, i) => s + (i.advCost || 0), 0);
  const isOther = sectionKey === "other";

  const formatMoney0 = (v: number) => `${v.toLocaleString()}.00`;
  const getCostTypeLabel = (i: AdvanceItem) =>
    i.costType === "Fix" ? `Fix (0 - ${i.pax} Pax)` : i.costType;

  const headerNameLabel = isOther
    ? "Items"
    : sectionKey === "guide"
      ? "Guide Items"
      : "Vehicle";

  const rowName = (i: AdvanceItem) => {
    if (!isOther) return i.name;
    return (
      <div className="inline-flex justify-start items-start flex-col gap-1">
        <div className="justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
          {i.name}
        </div>
        <div className="justify-start text-[#676363] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
          Remark :
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
                  <div className="p-0">{rowName(i)}</div>
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
  sectionKey: "guide" | "vehicle" | "other";
  items: AdvanceSections[typeof sectionKey];
  onSetCostUnit: (id: string, val: string) => void;
  onSetPax: (id: string, val: string) => void;
  onSetAdvCost: (id: string, val: string) => void;
}) {
  const checked = items.filter((i) => i.checked);
  const total = checked.reduce((s, i) => s + (i.advCost || 0), 0);
  const isOther = sectionKey === "other";
  const formatMoney0 = (v: number) => `${v.toLocaleString()}.00`;
  const getCostTypeLabel = (i: AdvanceItem) => (i.costType === "Fix" ? `Fix (0 - ${i.pax} Pax)` : i.costType);
  const headerNameLabel = isOther ? "Items" : sectionKey === "guide" ? "Guide Items" : "Vehicle";

  if (checked.length === 0) return <div className="px-5 py-6 text-center text-gray-400 text-sm">ไม่มีรายการ</div>;

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
            ];
          })}
          {extraItems.map(item => (
            <tr key={item.id} className="border-b border-gray-50 bg-white">
              <td className="px-3 py-2 text-center"><input type="checkbox" checked readOnly style={{ accentColor: "#B45309", width: 15, height: 15 }} /></td>
              <td className="px-3 py-2 text-gray-700">🔸 {item.name}</td>
              <td className="px-3 py-2 text-xs text-[#2a2a2a]">
                <div className="truncate" title={item.costType}>
                  {item.costType}
                </div>
              </td>
              <td className="px-3 py-2 text-center text-gray-600">{item.pax}</td>
              <td className="px-3 py-2 text-right text-gray-600">฿{item.costUnit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-bold text-amber-700">฿{item.advCost.toLocaleString()}</td>
              <td className="px-3 py-2 text-center text-gray-400 text-xs">{item.actPax}</td>
              <td className="px-3 py-2 text-right">฿{item.actCost.toLocaleString()}</td>
            </tr>
          ))}
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
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraModalRows, setExtraModalRows] = useState<ExtraModalRow[]>(() => [createEmptyExtraModalRow()]);
  const [showApprove, setShowApprove] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [localStatus, setLocalStatus] = useState(trip?.status ?? "Pending");
  const [openSecs, setOpenSecs] = useState<Record<SectionKey, boolean>>({
    guide: true, vehicle: true, other: true, allowance: true, extra: true,
  });
  const toggleSec = (k: SectionKey) => setOpenSecs(p => ({ ...p, [k]: !p[k] }));

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

  const toggleItem  = (sec: SectionKey, id: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, checked: !i.checked } : i) }));
  const setActPax   = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id !== id ? i : { ...i, actPax: Number(val), actCost: i.costType === "Person" ? i.costUnit * Number(val) : i.actCost }) }));
  const setActCost  = (sec: SectionKey, id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, actCost: Number(val) } : i) }));
  const setCostUnit = (sec: "guide" | "vehicle" | "other", id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, costUnit: Number(val || 0) } : i) }));
  const setPax = (sec: "guide" | "vehicle" | "other", id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, pax: Number(val || 0) } : i) }));
  const setAdvanceCost = (sec: "guide" | "vehicle" | "other", id: string, val: string) =>
    setSections(p => ({ ...p, [sec]: p[sec].map(i => i.id === id ? { ...i, advCost: Number(val || 0) } : i) }));

  const pendingView = localStatus === "Pending" && mode === "view";
  const advKeys     = (pendingView ? ["guide", "vehicle", "other"] : ["guide", "vehicle", "other", "allowance"]) as SectionKey[];
  const mainItems   = advKeys.flatMap(k => sections[k]).filter(i => i.checked);
  const totalAdv    = pendingView
    ? mainItems.reduce((s, i) => s + (i.advCost || 0), 0)
    : [...mainItems, ...extraItems.filter(i => i.checked)].reduce((s, i) => s + (i.advCost || 0), 0);
  const totalExtra  = pendingView
    ? 0
    : [...sections.extra.filter(i => i.checked), ...extraItems.filter(i => i.checked)].reduce((s, i) => s + (i.advCost || 0), 0);
  const grandTotal  = totalAdv + totalExtra;
  const statusStyle = STATUS_STYLE[localStatus];
  const bankColor   = BANK_COLOR[trip.bankName] ?? "#265ed6";

  const openExtraModal = () => {
    setExtraModalRows([createEmptyExtraModalRow()]);
    setShowExtraModal(true);
  };

  const closeExtraModal = () => {
    setShowExtraModal(false);
    setExtraModalRows([createEmptyExtraModalRow()]);
  };

  const confirmExtraModal = () => {
    const valid = extraModalRows.filter(
      r => r.itemName.trim() && Number(String(r.costUnit).replace(/,/g, "")) > 0,
    );
    if (valid.length === 0) return;
    const t = Date.now();
    setExtraItems(ex => [
      ...ex,
      ...valid.map((r, i) => {
        const unit = Number(String(r.costUnit).replace(/,/g, ""));
        const name = r.remark.trim() ? `${r.itemName} — ${r.remark.trim()}` : r.itemName;
        return {
          id: `ex${t}-${i}`,
          name,
          costType: r.costType,
          costUnit: unit,
          pax: trip.paxAdv,
          advCost: r.costType === "Person" ? unit * trip.paxAdv : unit,
          actPax: trip.checkedIn,
          actCost: r.costType === "Person" ? unit * trip.checkedIn : unit,
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
              <span>Expense</span><span>›</span>
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
                    onClick={() => setMode("edit")}
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
                {localStatus === "Pending" ? (
                  <>
                    <div className="self-stretch px-2 py-0.5 bg-[#ffefe6] rounded-2xl flex justify-center items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-[#fd5c04] rounded-full" />
                      <div className="text-center justify-start text-[#fd5c04] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
                        Pending
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
            {localStatus === "Pending" && (
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
            <div className={`flex flex-col gap-4 ${pendingView ? "" : ""}`}>

              {mode === "view" ? (
                pendingView ? (
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
                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          Guide
                        </div>
                      </div>
                      <PendingSectionViewTable sectionKey="guide" items={sections.guide} />

                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v13h18V3"/>
                          <path d="M7 16v4M17 16v4"/>
                          <path d="M7 8h10"/>
                        </svg>
                        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          Vehicle Cost
                        </div>
                      </div>
                      <PendingSectionViewTable sectionKey="vehicle" items={sections.vehicle} />

                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 12V7a2 2 0 0 0-2-2h-6l-2 2H4a2 2 0 0 0-2 2v5"/>
                          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
                        </svg>
                        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                          Other Expense
                        </div>
                      </div>
                      <PendingSectionViewTable sectionKey="other" items={sections.other} />
                    </div>
                  </div>
                ) : (
                  <>
                    {((pendingView ? ["guide","vehicle","other"] : ["guide","vehicle","other","allowance","extra"]) as SectionKey[]).map(key => {
                      const m = SEC[key];
                      const isOpen = openSecs[key];
                      const extraCount = key === "extra" ? extraItems.length : 0;
                      const totalCount = sections[key].filter(i => i.checked).length + extraCount;
                      return (
                        <div key={key} className="bg-white rounded-xl border border-[#E7E7E9] overflow-hidden">
                          <button
                            onClick={() => toggleSec(key)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{m.icon}</span>
                              <span className="font-semibold text-sm" style={{ color: m.color }}>
                                {pendingView
                                  ? (key === "guide" ? "Guide" : key === "vehicle" ? "Vehicle Cost" : "Other Expense")
                                  : SECTION_LABELS[key]}
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
                            pendingView ? (
                              <PendingSectionViewTable
                                sectionKey={key as "guide" | "vehicle" | "other"}
                                items={sections[key] as any}
                              />
                            ) : (
                              <SectionViewTable
                                sectionKey={key}
                                items={sections[key]}
                                extraItems={key === "extra" ? extraItems : []}
                              />
                            )
                          )}
                        </div>
                      );
                    })}

                    {/* ── Add Extra Advance ─────────────────────────────────── */}
                    {!pendingView && (
                      <div className="bg-white rounded-xl border border-[#E7E7E9] p-4">
                        <button
                          type="button"
                          onClick={openExtraModal}
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#D97706] border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB] rounded-xl px-4 py-3 hover:bg-[#FEF3C7] transition-colors"
                        >
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                          </svg>
                          + Add Extra Advance
                        </button>
                      </div>
                    )}
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
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Guide</div>
                    </div>
                    <PendingSectionEditTable
                      sectionKey="guide"
                      items={sections.guide}
                      onSetCostUnit={(id, val) => setCostUnit("guide", id, val)}
                      onSetPax={(id, val) => setPax("guide", id, val)}
                      onSetAdvCost={(id, val) => setAdvanceCost("guide", id, val)}
                    />

                    <div className="self-stretch inline-flex justify-start items-center gap-2 mt-4">
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Vehicle Cost</div>
                    </div>
                    <PendingSectionEditTable
                      sectionKey="vehicle"
                      items={sections.vehicle}
                      onSetCostUnit={(id, val) => setCostUnit("vehicle", id, val)}
                      onSetPax={(id, val) => setPax("vehicle", id, val)}
                      onSetAdvCost={(id, val) => setAdvanceCost("vehicle", id, val)}
                    />

                    <div className="self-stretch inline-flex justify-start items-center gap-2 mt-4">
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Other Expense</div>
                    </div>
                    <PendingSectionEditTable
                      sectionKey="other"
                      items={sections.other}
                      onSetCostUnit={(id, val) => setCostUnit("other", id, val)}
                      onSetPax={(id, val) => setPax("other", id, val)}
                      onSetAdvCost={(id, val) => setAdvanceCost("other", id, val)}
                    />

                    <div className="self-stretch inline-flex justify-start items-center gap-2 mt-4">
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Extra Advance</div>
                      <button
                        type="button"
                        onClick={openExtraModal}
                        className="px-5 py-2 bg-[#fd5c04] rounded-[100px] text-white text-base font-medium hover:opacity-95"
                      >
                        Add extra advance
                      </button>
                    </div>
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
                {!pendingView && mode === "view" && (
                  <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setShowApprove(true)}
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
                  <button
                    onClick={() => showToast("บันทึกเรียบร้อย ✓")}
                    className="px-5 py-2 bg-[#e3f1ff] rounded-[100px] inline-flex justify-center items-center gap-2 text-[#265ed6] text-base font-medium leading-6 tracking-tight"
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                      <path d="M19 21H5a2 2 0 01-2-2V7l4-4h12a2 2 0 012 2v14a2 2 0 01-2 2z"/>
                      <path d="M17 21v-8H7v8M7 3v4h8"/>
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={() => setShowApprove(true)}
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
        onRowsChange={setExtraModalRows}
        onClose={closeExtraModal}
        onConfirm={confirmExtraModal}
      />

      {showApprove && (
        <ApproveModal
          tripCode={trip.tripCode} program={trip.program}
          tripRound={trip.tripRound} guide={trip.guide}
          totalAdv={totalAdv}
          onClose={() => setShowApprove(false)}
          onConfirm={() => { setLocalStatus("Approved"); setShowApprove(false); showToast("Approve เรียบร้อย ✓"); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
