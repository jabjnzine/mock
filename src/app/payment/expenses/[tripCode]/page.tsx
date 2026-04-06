"use client";

import { useEffect, useState, use, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  AdvanceSections,
  INIT_TRIPS,
  ExpenseItem,
  ExpenseSections,
  PaymentType,
  SectionKey,
  initAdvSections,
  initExpSections,
} from "../../lib/payment-data";
import {
  expenseGetClientTripStatus,
  expenseGetTripExpenseDraft,
  expenseMarkTripStatus,
  expenseRequestCompletedTab,
  expenseSetTripExpenseDraft,
  expenseSetTripExpenseTotal,
} from "../../lib/expense-client-state";
import { advanceGetTripAdvanceDraft } from "../../lib/advance-client-state";
import { formatPaymentMoney, PAYMENT_BANK_COLOR } from "../../components/payment-table-styles";

const formatMoney = (value: number) => formatPaymentMoney(Number(value || 0));

function PaxBar({ paxAdv, checkedIn, noShow }: { paxAdv: number; checkedIn: number; noShow: number }) {
  const cards = [
    { label: "Pax No.ADV", value: paxAdv, bg: "#dceeff", stroke: "#265ed6" },
    { label: "Checked In", value: checkedIn, bg: "#e6f3e6", stroke: "#1cb579" },
    { label: "No show", value: noShow, bg: "#ffc3c3", stroke: "#d91616" },
    { label: "Amount Pax Act.", value: checkedIn, bg: "#e6f3e6", stroke: "#007800" },
  ] as const;

  return (
    <div className="self-stretch inline-flex justify-start items-center gap-6">
      {cards.map((card, idx) => (
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
  );
}

function ProgramInfoCard({ trip, status }: { trip: (typeof INIT_TRIPS)[number]; status: "Pending" | "Approved" | "Completed" }) {
  const tripTimeRaw = trip.tripRound.includes(":") ? trip.tripRound.split(":").slice(1).join(":").trim() : "07:30";
  const tripTime = tripTimeRaw.replace(":", " : ");
  const bankColor = PAYMENT_BANK_COLOR[trip.bankName] ?? "#2BB673";
  const statusStyle = status === "Completed"
    ? { bg: "#DCFCE7", color: "#14532D" }
    : status === "Approved"
      ? { bg: "#DBEAFE", color: "#1E40AF" }
      : { bg: "#ffefe6", color: "#fd5c04" };

  return (
    <div className="w-full p-6 bg-white rounded-2xl flex flex-col justify-start items-center gap-6 overflow-hidden">
      <div className="self-stretch inline-flex justify-start items-center">
        <div className="flex-1 flex justify-start items-center gap-6">
          <div className="flex justify-start items-start gap-2">
            <div className="h-8 px-2 py-0.5 bg-white rounded-[100px] border border-[#fd5c04] inline-flex items-center gap-1">
              <span className="text-[#fd5c04] text-sm">📅</span>
              <span className="text-[#fd5c04] text-sm">{trip.date}</span>
            </div>
            <div className="h-8 px-2 py-0.5 bg-white rounded-[100px] border border-[#1cb579] inline-flex items-center gap-1">
              <span className="text-[#1cb579] text-sm">🕒</span>
              <span className="text-[#1cb579] text-sm">{tripTime}</span>
            </div>
            <div className="h-8 px-2 py-0.5 bg-[#f8fcff] rounded-[100px] border border-[#265ed6] inline-flex items-center gap-1">
              <span className="text-[#265ed6] text-sm">👥</span>
              <span className="text-[#265ed6] text-sm">{trip.tripType}</span>
            </div>
          </div>
        </div>
        <div className="self-stretch flex justify-center items-center gap-3">
          <div className="self-stretch px-2 py-0.5 rounded-2xl flex justify-center items-center gap-1" style={{ backgroundColor: statusStyle.bg }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusStyle.color }} />
            <div className="text-center text-sm" style={{ color: statusStyle.color }}>{status}</div>
          </div>
          <div className="self-stretch px-2 py-1 bg-[#f8f8f8] rounded-[30px] inline-flex flex-col justify-center items-center gap-1">
            <div className="inline-flex justify-center items-center gap-1 text-[#142b41] text-sm">
              <span>👤</span>
              <span>{trip.paxAdv}/{30}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <div className="inline-flex justify-start items-center gap-2">
          <span className="text-[#265ed6] text-xl">📋</span>
          <div className="justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">
            Trip Code No. {trip.tripCode}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-start items-start gap-6">
          <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">Program name</div>
          <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">:</div>
          <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">{trip.program}</div>
        </div>
        <div className="self-stretch inline-flex justify-start items-start gap-6">
          <div className="w-[108px] justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">Remark</div>
          <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">:</div>
          <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">-</div>
        </div>
        <div className="self-stretch h-px bg-[#d9d9d9]" />
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Guide Information</div>
          <div className="self-stretch inline-flex justify-start items-start gap-6">
            <div className="w-[108px] justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">Book Bank</div>
            <div className="justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">:</div>
            <div className="flex-1 self-stretch flex justify-start items-center gap-3">
              <span className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: bankColor }}>฿</span>
              <div className="flex-1 text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">
                {trip.bankName} : {trip.bankNo} {trip.guide}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SectionTableRow = {
  id: string;
  section: SectionKey;
  item: string;
  remark?: string;
  option?: string;
  payment: PaymentType;
  costType: string;
  costUnit: number;
  advPax?: number | null;
  advCost?: number | null;
  actPax: number;
  expense: number;
  balance?: number | null;
  /** มีในโหมดแก้ไข: เอาไว้ปิด input เมื่อติ๊กออก (แถวยังอยู่จนกว่าจะบันทึก) */
  checked?: boolean;
};

type PageMode = "view" | "edit";

type ExtraExpenseModalRow = {
  id: string;
  sourceOtherId: string;
  remark: string;
  costUnit: string;
};

function formatCostUnitForInput(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function createEmptyExtraExpenseModalRow(): ExtraExpenseModalRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sourceOtherId: "",
    remark: "",
    costUnit: "0.00",
  };
}

function AddExtraExpenseModal({
  open,
  rows,
  otherExpenseItems,
  onRowsChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  rows: ExtraExpenseModalRow[];
  otherExpenseItems: ExpenseItem[];
  onRowsChange: React.Dispatch<React.SetStateAction<ExtraExpenseModalRow[]>>;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const updateRow = (id: string, patch: Partial<ExtraExpenseModalRow>) =>
    onRowsChange(prev => prev.map(row => (row.id === id ? { ...row, ...patch } : row)));

  const resolveSource = (sourceOtherId: string) =>
    otherExpenseItems.find(item => item.id === sourceOtherId);

  const parseCost = (s: string) => Number(String(s).replace(/,/g, "") || 0);
  const maxExtraRows = otherExpenseItems.length;
  const canAddRow = maxExtraRows > 0 && rows.length < maxExtraRows;
  const confirmEnabled =
    maxExtraRows > 0 &&
    rows.some(row => row.sourceOtherId && resolveSource(row.sourceOtherId) && parseCost(row.costUnit) > 0);
  const outlineField = "rounded-lg outline-1 -outline-offset-1 outline-[#d9d9d9] bg-white";

  return (
    <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4 font-['IBM_Plex_Sans_Thai']" onClick={onClose} role="presentation">
      <div className="w-full max-w-[800px] max-h-[90vh]" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="w-full bg-white rounded-2xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="pl-12 pr-6 pt-6 pb-3 bg-white flex justify-center items-start gap-2.5">
            <div className="flex-1 flex flex-col justify-start items-center gap-3 min-w-0">
              <div className="self-stretch text-center text-[#142b41] text-lg font-semibold leading-7 tracking-tight">Add Extra Expense</div>
              <div className="w-[210px] h-0 outline-4 -outline-offset-2 outline-[#97bee4]" />
            </div>
            <button type="button" onClick={onClose} aria-label="ปิด" className="w-6 h-6 shrink-0 flex items-center justify-center text-[#2a2a2a] hover:opacity-70 mt-0.5">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 flex flex-col gap-3 overflow-y-auto max-h-[min(55vh,480px)] w-full">
            {otherExpenseItems.length === 0 ? <p className="text-sm text-[#676363] w-full">ยังไม่มีรายการ Other Expense</p> : null}
            {rows.map(row => {
              const src = resolveSource(row.sourceOtherId);
              const takenByOtherRows = new Set(rows.filter(r => r.id !== row.id && r.sourceOtherId).map(r => r.sourceOtherId));
              return (
                <div key={row.id} className="w-full flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="w-[210px] min-w-[140px] flex flex-col gap-1">
                    <div className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Items</div>
                    <div className={`self-stretch min-h-10 px-3 py-2 flex items-center gap-2 ${outlineField}`}>
                      <select
                        value={row.sourceOtherId}
                        onChange={e => {
                          const sourceOtherId = e.target.value;
                          const source = resolveSource(sourceOtherId);
                          updateRow(row.id, { sourceOtherId, costUnit: source ? formatCostUnitForInput(source.costUnit) : "0.00" });
                        }}
                        disabled={otherExpenseItems.length === 0}
                        className={`flex-1 min-w-0 appearance-none bg-transparent text-base leading-6 tracking-tight outline-none border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${row.sourceOtherId ? "text-[#2a2a2a]" : "text-[#b9b9b9]"}`}
                      >
                        <option value="">Please select</option>
                        {otherExpenseItems.map(item => (
                          <option key={item.id} value={item.id} disabled={takenByOtherRows.has(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="w-40 min-w-[120px] flex flex-col gap-1">
                    <div className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Remark</div>
                    <div className={`self-stretch min-h-10 px-3 py-2 flex items-center gap-2 ${outlineField}`}>
                      <input type="text" placeholder="Please enter" value={row.remark} onChange={e => updateRow(row.id, { remark: e.target.value })} className="flex-1 min-w-0 bg-transparent text-base leading-6 tracking-tight placeholder:text-[#b9b9b9] text-[#2a2a2a] outline-none border-0" />
                    </div>
                  </div>

                  <div className="w-40 min-w-[120px] flex flex-col gap-1">
                    <div className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Cost Type</div>
                    <div className={`self-stretch h-10 px-3 py-1 flex items-center gap-2 ${outlineField}`}>
                      <div className={`flex-1 text-base leading-6 tracking-tight ${src ? "text-[#2a2a2a]" : "text-[#b9b9b9]"}`}>{src ? src.costType : "—"}</div>
                    </div>
                  </div>

                  <div className="w-[150px] min-w-[120px] flex flex-col gap-1">
                    <div className="text-[#2a2a2a] text-sm font-medium leading-5 tracking-tight">Cost (THB)</div>
                    <div className={`self-stretch h-10 px-3 py-1 flex items-center gap-2 ${outlineField}`}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.costUnit}
                        onChange={e => updateRow(row.id, { costUnit: e.target.value })}
                        disabled={!src}
                        placeholder="0.00"
                        className={`flex-1 min-w-0 bg-transparent text-base leading-6 tracking-tight outline-none border-0 text-right ${src ? "text-[#2a2a2a]" : "text-[#b9b9b9]"} disabled:cursor-not-allowed disabled:opacity-70`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={() => onRowsChange(prev => [...prev, createEmptyExtraExpenseModalRow()])} disabled={!canAddRow} className="py-1 rounded-[100px] inline-flex justify-start items-start gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#265ed6" strokeWidth={1.5} aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <div className="text-center text-[#265ed6] text-sm font-medium leading-5 tracking-tight">
                Add Item
                {maxExtraRows > 0 ? <span className="text-xs font-normal text-[#676363] ml-1">({rows.length}/{maxExtraRows})</span> : null}
              </div>
            </button>
          </div>

          <div className="w-full p-6 bg-[#f8f8f8] flex justify-end items-center gap-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-white rounded-[100px] outline-1 -outline-offset-1 outline-[#265ed6] text-[#265ed6] text-base font-medium leading-6 tracking-tight hover:bg-blue-50/40">Cancel</button>
            <button type="button" onClick={onConfirm} disabled={!confirmEnabled} className="px-5 py-2 bg-[#265ed6] rounded-[100px] text-white text-base font-medium leading-6 tracking-tight hover:bg-[#1f4fc0] disabled:opacity-40 disabled:cursor-not-allowed">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cloneExpenseSections(sections: ExpenseSections): ExpenseSections {
  return {
    guide: sections.guide.map(item => ({ ...item })),
    vehicle: sections.vehicle.map(item => ({ ...item })),
    other: sections.other.map(item => ({ ...item })),
    allowance: sections.allowance.map(item => ({ ...item })),
    extra: sections.extra.filter(item => item.name !== "ประกันการเดินทาง").map(item => ({ ...item })),
  };
}

function EditableExpenseSectionTable({
  title,
  rows,
  supplier,
  headerAction,
  onDeleteRow,
  onToggle,
  onSetCostUnit,
  onSetActPax,
  onSetExpense,
}: {
  title: string;
  rows: SectionTableRow[];
  supplier?: string;
  headerAction?: ReactNode;
  onDeleteRow?: (id: string) => void;
  onToggle: (section: SectionKey, id: string) => void;
  onSetCostUnit: (section: SectionKey, id: string, value: string) => void;
  onSetActPax: (section: SectionKey, id: string, value: string) => void;
  onSetExpense: (section: SectionKey, id: string, value: string) => void;
}) {
  const hasCash = title !== "Extra Expense" && rows.some(row => row.payment === "Cash");
  const totalRows = rows.filter(row => row.checked !== false);
  const totalAdvance = totalRows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.advCost || 0) : 0), 0);
  const totalExpense = totalRows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = totalRows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.balance || 0) : 0), 0);
  const showOption = title === "Other Expense" || title === "Extra Expense";
  const itemWidth = "flex-1";
  const isVehicle = ["Vehicle Cost", "Supplier Cost", "Own Vehicle Cost"].includes(title);
  const paymentWidth = isVehicle ? "w-[120px]" : "w-[82px]";
  const showCostType = !isVehicle;
  const showDelete = title === "Extra Expense" && Boolean(onDeleteRow);

  return (
    <div className="w-full p-6 bg-white flex flex-col justify-center items-stretch gap-3">
      <div className="w-full flex justify-start items-center gap-2">
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">{title}</div>
        {headerAction}
      </div>
      {supplier ? (
        <div className="self-stretch justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">
          Supplier :<span className="text-[#2a2a2a]"> {supplier}</span>
        </div>
      ) : null}
      <div className="w-full rounded-lg outline -outline-offset-1 outline-[#d9d9d9] overflow-hidden">
        <div className="w-full rounded-tl-lg rounded-tr-lg flex justify-start items-start overflow-hidden">
          <div className="w-10 h-11 p-2 bg-[#142b41] flex justify-center items-center overflow-hidden">
            <div className="w-4 h-4 rounded border border-white/80" />
          </div>
          <div className={`${itemWidth} h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center overflow-hidden`}>
            <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">{title === "Guide" ? "Guide Items" : isVehicle ? "Vehicle" : "Items"}</div>
          </div>
          {showOption ? <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex items-center"><div className="text-white text-base font-medium">Option</div></div> : null}
          <div className={`${paymentWidth} h-11 p-2 bg-[#142b41] border-l border-white flex items-center`}><div className="text-white text-base font-medium">Payment</div></div>
          {showCostType ? <div className="w-[100px] h-11 p-2 bg-[#142b41] border-l border-white flex items-center"><div className="text-white text-base font-medium">Cost Type</div></div> : null}
          <div className="w-24 h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center"><div className="text-white text-base font-medium">Cost (Unit)</div></div>
          {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center"><div className="text-white text-base font-medium">Adv.Pax</div></div> : null}
          {hasCash ? <div className="w-24 h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center"><div className="text-white text-base font-medium">Adv. Cost</div></div> : null}
          {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center"><div className="text-white text-base font-medium">Act.Pax</div></div> : null}
          <div className="w-24 h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center"><div className="text-white text-base font-medium">Expense</div></div>
          {hasCash ? <div className="w-24 h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center"><div className="text-white text-base font-medium">Balance</div></div> : null}
          {showDelete ? <div className="w-10 h-11 p-2 bg-[#142b41] border-l border-white flex justify-center items-center" /> : null}
        </div>

        {rows.map((row, index) => {
          const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
          const rowChecked = row.checked !== false;
          const inputsDisabled = !rowChecked;
          return (
            <div key={row.id} className="w-full flex justify-start items-start">
              <div className={`w-10 h-[62px] p-2 ${rowBg} flex justify-center items-center`}>
                <input type="checkbox" checked={rowChecked} onChange={() => onToggle(row.section, row.id)} className="h-4 w-4 accent-[#265ed6]" />
              </div>
              <div className={`${itemWidth} h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex flex-col justify-center items-start gap-1 overflow-hidden ${inputsDisabled ? "opacity-60" : ""}`}>
                <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div>
                {showOption ? <div className="justify-start text-[#676363] text-xs font-normal leading-[18px]">Remark : {row.remark ?? ""}</div> : null}
              </div>
              {showOption ? <div className={`w-[120px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex items-center ${inputsDisabled ? "opacity-60" : ""}`}><div className="text-[#2a2a2a] text-base">{row.option ?? "-"}</div></div> : null}
              <div className={`${paymentWidth} h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex items-center ${inputsDisabled ? "opacity-60" : ""}`}><div className="text-[#2a2a2a] text-base">{row.payment}</div></div>
              {showCostType ? <div className={`w-[100px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex items-center ${inputsDisabled ? "opacity-60" : ""}`}><div className="text-[#2a2a2a] text-base">{row.costType}</div></div> : null}
              <div className={`w-24 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                <input
                  value={String(row.costUnit)}
                  onChange={e => onSetCostUnit(row.section, row.id, e.target.value)}
                  disabled={inputsDisabled}
                  className="w-full rounded-md border border-[#D9E5FF] bg-white px-2 py-1 text-right text-sm text-[#2a2a2a] outline-none disabled:border-transparent disabled:bg-transparent disabled:text-[#2a2a2a] disabled:opacity-70"
                />
              </div>
              {hasCash ? <div className={`w-[70px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center text-[#2a2a2a] text-base ${inputsDisabled ? "opacity-60" : ""}`}>{row.payment === "Cash" ? (row.advPax ?? "-") : "-"}</div> : null}
              {hasCash ? <div className={`w-24 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center text-[#2a2a2a] text-base ${inputsDisabled ? "opacity-60" : ""}`}>{row.payment === "Cash" && row.advCost != null ? formatMoney(row.advCost) : "-"}</div> : null}
              {hasCash ? (
                <div className={`w-[70px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                  <input
                    value={row.payment === "Cash" ? String(row.actPax) : "-"}
                    onChange={e => onSetActPax(row.section, row.id, e.target.value)}
                    disabled={row.payment !== "Cash" || inputsDisabled}
                    className="w-full rounded-md border border-[#FFDABF] bg-white px-2 py-1 text-right text-sm text-[#2a2a2a] outline-none disabled:border-transparent disabled:bg-transparent disabled:text-[#2a2a2a] disabled:opacity-70"
                  />
                </div>
              ) : null}
              <div className={`w-24 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center`}>
                <input
                  value={String(row.expense)}
                  onChange={e => onSetExpense(row.section, row.id, e.target.value)}
                  disabled={inputsDisabled}
                  className="w-full rounded-md border border-[#FFDABF] bg-white px-2 py-1 text-right text-sm text-[#2a2a2a] outline-none disabled:border-transparent disabled:bg-transparent disabled:text-[#2a2a2a] disabled:opacity-70"
                />
              </div>
              {hasCash ? <div className={`w-24 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center text-base ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : Number(row.balance || 0) > 0 ? "text-[#1cb579]" : "text-[#2a2a2a]"} ${inputsDisabled ? "opacity-60" : ""}`}>{row.payment === "Cash" && row.balance != null ? formatMoney(row.balance) : "-"}</div> : null}
              {showDelete ? (
                <div className={`w-10 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-center items-center`}>
                  {inputsDisabled ? (
                    <span className="w-6 h-6 shrink-0 block opacity-30" aria-hidden />
                  ) : (
                    <ExtraExpenseDeleteIconButton onClick={() => onDeleteRow?.(row.id)} label="ลบรายการ Extra Expense" />
                  )}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="w-full flex justify-start items-start border-t border-[#d9d9d9]">
          <div className="w-10 h-12 bg-white" />
          <div className={`${itemWidth} h-12 px-[15px] py-3 bg-white flex items-center`}>
            <div className="justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div>
          </div>
          {showOption ? <div className="w-[120px] h-12 bg-white" /> : null}
          <div className={`${paymentWidth} h-12 bg-white`} />
          {showCostType ? <div className="w-[100px] h-12 bg-white" /> : null}
          <div className="w-24 h-12 bg-white" />
          {hasCash ? <div className="w-[70px] h-12 bg-white" /> : null}
          {hasCash ? (
            <div className="w-24 h-12 px-[15px] py-3 bg-white flex justify-end items-center text-[#265ed6] text-base font-medium">
              {formatMoney(totalAdvance)}
            </div>
          ) : null}
          {hasCash ? <div className="w-[70px] h-12 bg-white" /> : null}
          <div className="w-24 h-12 px-[15px] py-3 bg-white flex justify-end items-center text-[#fd5c04] text-base font-medium">
            {formatMoney(totalExpense)}
          </div>
          {hasCash ? (
            <div className={`w-24 h-12 px-[15px] py-3 bg-white flex justify-end items-center text-base font-medium ${totalBalance < 0 ? "text-[#d91616]" : totalBalance > 0 ? "text-[#1cb579]" : "text-[#2a2a2a]"}`}>
              {totalBalance === 0 ? "-" : formatMoney(totalBalance)}
            </div>
          ) : null}
          {showDelete ? <div className="w-10 h-12 bg-white" /> : null}
        </div>
      </div>
    </div>
  );
}

function EmptyExtraExpenseSection({ headerAction }: { headerAction?: ReactNode }) {
  return (
    <div className="w-full p-6 bg-white flex flex-col justify-center items-stretch gap-3">
      <div className="w-full flex justify-start items-center gap-2">
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Extra Expense</div>
        {headerAction}
      </div>
    </div>
  );
}

function ExtraExpenseDeleteIconButton({ onClick, label }: { onClick: () => void; label: string }) {
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

function GuideSectionTable({ rows }: { rows: SectionTableRow[] }) {
  const hasCash = rows.some(row => row.payment === "Cash");
  const totalAdvance = rows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.advCost || 0) : 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.balance || 0) : 0), 0);

  return (
    <div className="self-stretch p-6 bg-white inline-flex flex-col justify-center items-start gap-3">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <span className="text-[#265ed6] text-lg">👥</span>
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Guide</div>
      </div>
      <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden">
        <div className="self-stretch bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
              <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="w-[34px] flex justify-start items-center gap-1">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                </div>
              </div>
              <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Guide Items</div>
                </div>
              </div>
              <div className="w-[82px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Payment</div>
                </div>
              </div>
              <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div>
                </div>
              </div>
              <div className="w-24 h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost (Unit)</div>
                </div>
              </div>
              {hasCash ? (
                <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv.Pax</div>
                  </div>
                </div>
              ) : null}
              {hasCash ? (
                <div className="w-24 h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv. Cost</div>
                  </div>
                </div>
              ) : null}
              {hasCash ? (
                <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Act.Pax</div>
                  </div>
                </div>
              ) : null}
              <div className="w-24 h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Expense</div>
                </div>
              </div>
              {hasCash ? (
                <div className="w-24 h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Balance</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start">
            {rows.map((row, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
              return (
                <div key={row.id} className="self-stretch inline-flex justify-start items-start">
                  <div className={`w-16 h-14 p-2 ${rowBg} flex justify-center items-center gap-1 overflow-hidden`}>
                    <div className="w-[34px] flex justify-start items-center gap-1">
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{index + 1}</div>
                    </div>
                  </div>
                  <div className={`flex-1 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div>
                  </div>
                  <div className={`w-[82px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment}</div>
                  </div>
                  <div className={`w-[120px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.costType}</div>
                  </div>
                  <div className={`w-24 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.costUnit)}</div>
                  </div>
                  {hasCash ? (
                    <div className={`w-[70px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" ? (row.advPax ?? "-") : "-"}</div>
                    </div>
                  ) : null}
                  {hasCash ? (
                    <div className={`w-24 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" && row.advCost != null ? formatMoney(row.advCost) : "-"}</div>
                    </div>
                  ) : null}
                  {hasCash ? (
                    <div className={`w-[70px] h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" ? row.actPax : "-"}</div>
                    </div>
                  ) : null}
                  <div className={`w-24 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.expense)}</div>
                  </div>
                  {hasCash ? (
                    <div className={`w-24 h-14 p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                      <div className={`justify-start text-base font-normal leading-6 tracking-tight ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : "text-[#2a2a2a]"}`}>
                        {row.payment === "Cash" && row.balance != null ? formatMoney(row.balance) : "-"}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="self-stretch inline-flex justify-start items-start">
            <div className={`${hasCash ? "w-[809px]" : "w-[803px]"} h-12 relative bg-white border-t border-[#d9d9d9]`}>
              <div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div>
            </div>
            {hasCash ? <div className="w-[70px] h-12 px-[15px] py-3 bg-white border-t border-[#d9d9d9]" /> : null}
            {hasCash ? (
              <div className="w-24 px-[15px] py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">{formatMoney(totalAdvance)}</div>
              </div>
            ) : null}
            {hasCash ? <div className="w-[70px] h-12 px-[15px] py-3 bg-white border-t border-[#d9d9d9]" /> : null}
            <div className="flex-1 px-[15px] py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
              <div className="text-right justify-start text-[#fd5c04] text-base font-medium leading-6 tracking-tight">{formatMoney(totalExpense)}</div>
            </div>
            {hasCash ? (
              <div className="w-24 px-[15px] py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">{totalBalance === 0 ? "-" : formatMoney(totalBalance)}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleSectionTable({ rows, supplier, title = "Vehicle Cost" }: { rows: SectionTableRow[]; supplier?: string; title?: string }) {
  const hasCash = rows.some(row => row.payment === "Cash");
  const totalAdvance = rows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.advCost || 0) : 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + (row.payment === "Cash" ? Number(row.balance || 0) : 0), 0);
  const isSupplierTable = title === "Supplier Cost";
  const totalLabelWidth = isSupplierTable ? "w-[calc(100%-320px)]" : "w-[calc(100%-460px)]";
  const resolveSupplierVehicle = (value: string) => {
    const [left, right] = value.split("—").map((part) => part.trim());
    return {
      supplierName: supplier ?? left ?? "-",
      vehicleName: right || value,
    };
  };

  return (
    <div className="w-full flex flex-col justify-center items-stretch gap-3">
      <div className="self-stretch inline-flex justify-start items-center gap-2.5">
        <div className="flex-1 justify-center text-[#265ed6] text-base font-medium leading-6 tracking-tight">{title}</div>
        <div className="flex-1 flex justify-end items-center gap-2.5" />
      </div>
      <div className="w-full rounded-lg outline -outline-offset-1 outline-[#d9d9d9] overflow-hidden">
        <div className="w-full bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-stretch">
          <div className="w-full flex flex-col justify-start items-stretch">
            <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
              <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="w-[34px] flex justify-start items-center gap-1">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                </div>
              </div>
              {isSupplierTable ? <div className="w-[222px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Supplier Name</div></div> : null}
              <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Vehicle</div>
                </div>
              </div>
              {!isSupplierTable ? <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Item</div></div> : null}
              <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Payment</div>
                </div>
              </div>
              {!isSupplierTable ? <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div></div> : null}
              <div className="w-[133px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost</div>
                </div>
              </div>
              {hasCash ? (
                !isSupplierTable ? <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Pax</div>
                  </div>
                </div> : null
              ) : null}
              {hasCash ? (
                <div className="w-[110px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv. Cost</div>
                  </div>
                </div>
              ) : null}
              {hasCash ? (
                !isSupplierTable ? <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">AdtPax</div>
                  </div>
                </div> : null
              ) : null}
              <div className="w-[110px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Expense</div>
                </div>
              </div>
              {hasCash ? (
                <div className="w-[100px] h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Balance</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-stretch">
            {rows.map((row, index) => (
              <div key={row.id} className="self-stretch inline-flex justify-start items-start">
                <div className={`w-16 h-14 p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} flex justify-center items-center gap-1 overflow-hidden`}>
                  <div className="w-[34px] flex justify-start items-center gap-1">
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{index + 1}</div>
                  </div>
                </div>
                {isSupplierTable ? <div className={`w-[222px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{resolveSupplierVehicle(row.item).supplierName}</div></div> : null}
                <div className={`flex-1 h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden`}>
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{isSupplierTable ? resolveSupplierVehicle(row.item).vehicleName : "-"}</div>
                </div>
                {!isSupplierTable ? <div className={`flex-1 h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div></div> : null}
                <div className={`w-[120px] h-14 p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment}</div>
                </div>
                {!isSupplierTable ? <div className={`w-[120px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.costType}</div></div> : null}
                <div className={`w-[133px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.costUnit)}</div>
                </div>
                {hasCash ? (
                  !isSupplierTable ? <div className={`w-[70px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" ? (row.advPax ?? "-") : "-"}</div>
                  </div> : null
                ) : null}
                {hasCash ? (
                  <div className={`w-[110px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" && row.advCost != null ? formatMoney(row.advCost) : "-"}</div>
                  </div>
                ) : null}
                {hasCash ? (
                  !isSupplierTable ? <div className={`w-[70px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment === "Cash" ? row.actPax : "-"}</div>
                  </div> : null
                ) : null}
                <div className={`w-[110px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.expense)}</div>
                </div>
                {hasCash ? (
                  <div className={`w-[100px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className={`justify-start text-base font-normal leading-6 tracking-tight ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : "text-[#1cb579]"}`}>
                      {row.payment === "Cash" && row.balance != null ? formatMoney(row.balance) : "0.00"}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="self-stretch inline-flex justify-start items-start">
            <div className={`${totalLabelWidth} h-12 relative bg-white border-t border-[#d9d9d9]`}>
              <div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div>
            </div>
            {!isSupplierTable ? <div className="w-[70px] h-12 px-2 py-3 bg-white border-t border-[#d9d9d9]" /> : null}
            {hasCash ? (
              <div className="w-[110px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">{formatMoney(totalAdvance)}</div>
              </div>
            ) : null}
            {!isSupplierTable && hasCash ? <div className="w-[70px] h-12 px-2 py-3 bg-white border-t border-[#d9d9d9]" /> : null}
            <div className="w-[110px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
              <div className="text-right justify-start text-[#fd5c04] text-base font-medium leading-6 tracking-tight">{formatMoney(totalExpense)}</div>
            </div>
            {hasCash ? (
              <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#1cb579] text-base font-medium leading-6 tracking-tight">{totalBalance === 0 ? "0.00" : formatMoney(totalBalance)}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function OtherExpenseSectionTable({ rows }: { rows: SectionTableRow[] }) {
  const hasCash = rows.some(row => row.payment === "Cash");
  const totalAdvance = rows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + Number(row.balance || 0), 0);

  return (
    <div className="self-stretch p-6 bg-white inline-flex flex-col justify-center items-start gap-3 w-full">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <span className="text-[#265ed6] text-lg">📋</span>
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Other Expense</div>
      </div>
      <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden">
        <div className="self-stretch bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
              <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="w-[34px] flex justify-start items-center gap-1">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                </div>
              </div>
              <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Items</div>
                </div>
              </div>
              <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Option</div>
                </div>
              </div>
              <div className="w-[82px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Payment</div>
                </div>
              </div>
              <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div>
                </div>
              </div>
              <div className="w-[100px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost (Unit)</div>
                </div>
              </div>
              {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv.Pax</div>
                </div>
              </div> : null}
              {hasCash ? <div className="w-[100px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv. Cost</div>
                </div>
              </div> : null}
              {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Act.Pax</div>
                </div>
              </div> : null}
              <div className="w-[100px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Expense</div>
                </div>
              </div>
              {hasCash ? <div className="w-[100px] h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                <div className="flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Balance</div>
                </div>
              </div> : null}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start">
            {rows.map((row, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
              return (
                <div key={row.id} className="self-stretch inline-flex justify-start items-start">
                  <div className={`w-16 h-[62px] p-2 ${rowBg} flex justify-center items-center gap-1 overflow-hidden`}>
                    <div className="w-[34px] flex justify-start items-center gap-1">
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{index + 1}</div>
                    </div>
                  </div>
                  <div className={`flex-1 h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div>
                    <div className="justify-start text-[#676363] text-xs font-normal leading-[18px]">Remark : {row.remark ?? ""}</div>
                  </div>
                  <div className={`w-[120px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.option ?? "-"}</div>
                  </div>
                  <div className={`w-[82px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment}</div>
                  </div>
                  <div className={`w-[120px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.costType}</div>
                  </div>
                  <div className={`w-[100px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.costUnit)}</div>
                  </div>
                  {hasCash ? <div className={`w-[70px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advPax ?? "-"}</div>
                  </div> : null}
                  {hasCash ? <div className={`w-[100px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advCost != null ? formatMoney(row.advCost) : "-"}</div>
                  </div> : null}
                  {hasCash ? <div className={`w-[70px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.actPax}</div>
                  </div> : null}
                  <div className={`w-[100px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.expense)}</div>
                  </div>
                  {hasCash ? <div className={`w-[100px] h-[62px] p-2 ${rowBg} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    <div className={`justify-start text-base font-normal leading-6 tracking-tight ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : "text-[#2a2a2a]"}`}>
                      {row.balance != null ? formatMoney(row.balance) : "-"}
                    </div>
                  </div> : null}
                </div>
              );
            })}
          </div>
          <div className="self-stretch inline-flex justify-start items-start">
            <div className={`${hasCash ? "flex-1" : "flex-1"} h-12 relative bg-white border-t border-[#d9d9d9]`}>
              <div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div>
            </div>
            {hasCash ? <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
              <div className="text-right justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">{formatMoney(totalAdvance)}</div>
            </div> : null}
            {hasCash ? <div className="w-[70px] h-12 px-[15px] py-3 bg-white border-t border-[#d9d9d9]" /> : null}
            <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
              <div className="text-right justify-start text-[#fd5c04] text-base font-medium leading-6 tracking-tight">{formatMoney(totalExpense)}</div>
            </div>
            {hasCash ? <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
              <div className="text-right justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">{formatMoney(totalBalance)}</div>
            </div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtraExpenseSectionTable({ rows }: { rows: SectionTableRow[] }) {
  const hasCash = false;
  const totalAdvance = rows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + Number(row.balance || 0), 0);

  return (
    <div className="self-stretch p-6 bg-white inline-flex flex-col justify-center items-start gap-3">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <span className="text-[#265ed6] text-lg">📎</span>
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Extra Expense</div>
      </div>
      <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden">
        <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-center items-start gap-3 overflow-hidden">
          <div className="self-stretch bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch rounded-tl-lg rounded-tr-lg inline-flex justify-start items-start overflow-hidden">
                  <div className="w-16 h-11 p-2 bg-[#142b41] flex justify-center items-center gap-2.5 overflow-hidden">
                    <div className="w-[34px] flex justify-start items-center gap-1">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">#</div>
                    </div>
                  </div>
                  <div className="flex-1 h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Items</div>
                    </div>
                  </div>
                  <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Option</div>
                    </div>
                  </div>
                  <div className="w-[82px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Payment</div>
                    </div>
                  </div>
                  <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div>
                    </div>
                  </div>
                  <div className="w-[100px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost (Unit)</div>
                    </div>
                  </div>
                  {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv.Pax</div>
                    </div>
                  </div> : null}
                  {hasCash ? <div className="w-[100px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv. Cost</div>
                    </div>
                  </div> : null}
                  {hasCash ? <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Act.Pax</div>
                    </div>
                  </div> : null}
                  <div className="w-[100px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Expense</div>
                    </div>
                  </div>
                  {hasCash ? <div className="w-[100px] h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden">
                    <div className="flex justify-start items-center gap-2">
                      <div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Balance</div>
                    </div>
                  </div> : null}
                </div>
              </div>
            </div>
            {rows.map((row, index) => (
              <div key={row.id} className="self-stretch inline-flex justify-start items-start">
                <div className="w-16 h-[62px] p-2 bg-white flex justify-center items-center gap-1 overflow-hidden">
                  <div className="w-[34px] flex justify-start items-center gap-1">
                    <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{index + 1}</div>
                  </div>
                </div>
                <div className="flex-1 p-2 bg-white border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div>
                  <div className="justify-start text-[#676363] text-xs font-normal leading-[18px]">Remark : {row.remark ?? ""}</div>
                </div>
                <div className="w-[120px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.option ?? "-"}</div>
                </div>
                <div className="w-[82px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment}</div>
                </div>
                <div className="w-[120px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.costType}</div>
                </div>
                <div className="w-[100px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.costUnit)}</div>
                </div>
                {hasCash ? <div className="w-[70px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advPax ?? "-"}</div>
                </div> : null}
                {hasCash ? <div className="w-[100px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advCost != null ? formatMoney(row.advCost) : "-"}</div>
                </div> : null}
                {hasCash ? <div className="w-[70px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.actPax}</div>
                </div> : null}
                <div className="w-[100px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.expense)}</div>
                </div>
                {hasCash ? <div className="w-[100px] h-[62px] p-2 bg-white border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden">
                  <div className={`justify-start text-base font-normal leading-6 tracking-tight ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : "text-[#2a2a2a]"}`}>
                    {row.balance != null ? formatMoney(row.balance) : "-"}
                  </div>
                </div> : null}
              </div>
            ))}
            <div className="self-stretch inline-flex justify-start items-start">
              <div className={`${hasCash ? "flex-1" : "flex-1"} h-12 relative bg-white border-t border-[#d9d9d9]`}>
                <div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div>
              </div>
              {hasCash ? <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">{formatMoney(totalAdvance)}</div>
              </div> : null}
              {hasCash ? <div className="w-[70px] h-12 px-[15px] py-3 bg-white border-t border-[#d9d9d9]" /> : null}
              <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#fd5c04] text-base font-medium leading-6 tracking-tight">{formatMoney(totalExpense)}</div>
              </div>
              {hasCash ? <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5">
                <div className="text-right justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">{formatMoney(totalBalance)}</div>
              </div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseSectionTable({
  title,
  icon,
  rows,
  supplier,
  showOption = false,
  showAdvanceColumns = false,
  showBalance = false,
}: {
  title: string;
  icon: string;
  rows: SectionTableRow[];
  supplier?: string;
  showOption?: boolean;
  showAdvanceColumns?: boolean;
  showBalance?: boolean;
}) {
  const totalAdvance = rows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + Number(row.balance || 0), 0);
  const isGuide = title === "Guide";
  const isVehicle = ["Vehicle Cost", "Supplier Cost", "Own Vehicle Cost"].includes(title);
  const showCostType = !isVehicle;
  const showActPax = !isVehicle;
  const paymentWidthClass = isGuide ? "w-[82px]" : isVehicle ? "w-[120px]" : "w-[82px]";
  const totalLabelColSpan = showOption ? 6 : isVehicle ? 3 : 5;

  return (
    <div className="self-stretch p-6 bg-white flex flex-col justify-center items-start gap-3">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <span className="text-[#265ed6] text-lg">{icon}</span>
        <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">{title}</div>
      </div>
      {supplier ? (
        <div className="justify-start text-[#265ed6] text-sm font-medium leading-[18px] tracking-tight">
          Supplier : <span className="text-[#2a2a2a]">{supplier}</span>
        </div>
      ) : null}
      <div className="self-stretch rounded-lg outline -outline-offset-1 outline-[#d9d9d9] overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-[#142b41]">
              <th className="w-16 p-2 text-left text-white text-base font-medium">#</th>
              <th className="p-2 border-l border-white text-left text-white text-sm font-medium">{title === "Guide" ? "Guide Items" : isVehicle ? "Vehicle" : "Items"}</th>
              {showOption ? <th className="w-[120px] p-2 border-l border-white text-left text-white text-base font-medium">Option</th> : null}
              <th className={`${paymentWidthClass} p-2 border-l border-white text-left text-white text-base font-medium`}>Payment</th>
              {showCostType ? <th className="w-[120px] p-2 border-l border-white text-left text-white text-base font-medium">Cost Type</th> : null}
              <th className="w-24 p-2 border-l border-white text-right text-white text-base font-medium">Cost (Unit)</th>
              {showAdvanceColumns ? <th className="w-[70px] p-2 border-l border-white text-center text-white text-base font-medium bg-[#265ed6]">Adv.Pax</th> : null}
              {showAdvanceColumns ? <th className="w-24 p-2 border-l border-white text-right text-white text-base font-medium bg-[#265ed6]">Adv. Cost</th> : null}
              {showActPax ? <th className="w-[70px] p-2 border-l border-white text-center text-white text-base font-medium bg-[#fd5c04]">Act.Pax</th> : null}
              <th className="w-24 p-2 border-l border-white text-right text-white text-base font-medium bg-[#fd5c04]">Expense</th>
              {showBalance ? <th className="w-24 p-2 border-l border-white text-right text-white text-base font-medium bg-[#1cb579]">Balance</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
              return (
                <tr key={row.id} className={`${rowBg} border-b border-[#E7E7E9]`}>
                  <td className="p-2 align-top text-[#2a2a2a] text-sm">{index + 1}</td>
                  <td className="p-2 border-l border-[#d9d9d9] align-top">
                    <div className="text-[#2a2a2a] text-sm">{row.item}</div>
                    {row.remark ? <div className="text-[#676363] text-xs mt-1">Remark : {row.remark}</div> : null}
                  </td>
                  {showOption ? <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.option ?? "-"}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.payment}</td>
                  {showCostType ? <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.costType}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{formatMoney(row.costUnit)}</td>
                  {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.advPax ?? "-"}</td> : null}
                  {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.advCost != null ? formatMoney(row.advCost) : "-"}</td> : null}
                  {showActPax ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.actPax}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{formatMoney(row.expense)}</td>
                  {showBalance ? (
                    <td className={`p-2 border-l border-[#d9d9d9] align-top text-right text-sm ${Number(row.balance || 0) < 0 ? "text-[#d91616]" : "text-[#2a2a2a]"}`}>
                      {row.balance != null ? `${Number(row.balance) < 0 ? "" : "+"}${formatMoney(row.balance)}` : "-"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-white">
              <td colSpan={totalLabelColSpan} className="p-2 text-[#265ed6] text-base font-medium">Total</td>
              {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9]" /> : null}
              {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9] text-right text-[#265ed6] text-base font-medium">{formatMoney(totalAdvance)}</td> : null}
              {showActPax ? <td className="p-2 border-l border-[#d9d9d9]" /> : null}
              <td className="p-2 border-l border-[#d9d9d9] text-right text-[#fd5c04] text-base font-medium">{formatMoney(totalExpense)}</td>
              {showBalance ? <td className="p-2 border-l border-[#d9d9d9] text-right text-[#2a2a2a] text-base font-medium">{totalBalance === 0 ? "-" : formatMoney(totalBalance)}</td> : null}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ sections, advSections, extraAdvanceRows }: { sections: ExpenseSections; advSections: AdvanceSections; extraAdvanceRows: SectionTableRow[] }) {
  const sectionEntries = (Object.entries(sections) as [SectionKey, ExpenseItem[]][])
    .filter(([key, items]) => key !== "allowance" && items.some(item => item.checked));
  const cashItems: Array<{ key: string; label: string; total: number }> = sectionEntries.map(([key, items]) => ({
    key,
    label: key === "extra" ? "Extra Expense" : key === "other" ? "Other Expense" : key[0].toUpperCase() + key.slice(1),
    total: items
      .filter(item => item.checked && item.payment === "Cash")
      .reduce((sum, item) => sum + Number(advSections[key].find(advItem => advItem.id === item.id)?.advCost || 0), 0),
  })).filter(item => item.total > 0);
  const extraAdvanceCash = extraAdvanceRows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const costItems: Array<{ key: string; label: string; total: number }> = sectionEntries.map(([key, items]) => ({
    key,
    label: key === "extra" ? "Extra Expense" : key === "other" ? "Other Expense" : key[0].toUpperCase() + key.slice(1),
    total: items
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.actCost, 0),
  })).filter(item => item.total > 0);
  const extraAdvanceCost = extraAdvanceRows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  if (extraAdvanceCash > 0) {
    cashItems.push({ key: "extra-advance", label: "Extra Advance", total: extraAdvanceCash });
  }
  if (extraAdvanceCost > 0) {
    costItems.push({ key: "extra-advance", label: "Extra Advance", total: extraAdvanceCost });
  }
  const totalCash = cashItems.reduce((sum, item) => sum + item.total, 0);
  const totalCost = costItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E9] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E7E7E9] text-[#265ed6] text-sm font-bold">Summary</div>
      <div className="px-5 py-4 border-b border-[#E7E7E9]">
        <div className="text-[#265ed6] text-sm font-bold mb-3">Cash Items</div>
        <div className="space-y-2 text-sm">
          {cashItems.map(item => (
            <div key={item.key} className="flex items-center justify-between text-[#2a2a2a]">
              <span>{item.label}</span>
              <span>{`฿${formatMoney(item.total)}`}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[#2a2a2a] text-sm">Total Cash</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#f8f8f8] text-[#265ed6] text-sm font-bold min-w-[116px] text-right">{`฿${formatMoney(totalCash)}`}</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="text-[#fd8a2b] text-sm font-bold mb-3">Cost Items</div>
        <div className="space-y-2 text-sm">
          {costItems.map(item => (
            <div key={item.key} className="flex items-center justify-between text-[#2a2a2a]">
              <span>{item.label}</span>
              <span>{`฿${formatMoney(item.total)}`}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[#2a2a2a] text-sm">Total Cost (THB)</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#f8f8f8] text-[#fd8a2b] text-sm font-bold min-w-[116px] text-right">{`฿${formatMoney(totalCost)}`}</span>
        </div>
      </div>
    </div>
  );
}

function splitRemark(name: string) {
  const [headline, remark] = name.split("—").map(part => part.trim());
  return { headline, remark };
}

export default function ExpenseDetailPage({ params }: { params: Promise<{ tripCode: string }> }) {
  const { tripCode } = use(params);
  const router = useRouter();
  const trip = INIT_TRIPS.find(t => t.tripCode === tripCode);

  if (!trip) {
    return (
      <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-stone-50 p-6 flex items-center justify-center">
            <div className="text-gray-400">ไม่พบ Trip Code: {tripCode}</div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const [mode, setMode] = useState<PageMode>("view");
  const [savedSections, setSavedSections] = useState<ExpenseSections>(cloneExpenseSections(initExpSections(trip)));
  const [sections, setSections] = useState<ExpenseSections>(cloneExpenseSections(initExpSections(trip)));
  const [localStatus, setLocalStatus] = useState(trip.status);
  const [showExtraExpenseModal, setShowExtraExpenseModal] = useState(false);
  const [extraExpenseModalRows, setExtraExpenseModalRows] = useState<ExtraExpenseModalRow[]>(() => [createEmptyExtraExpenseModalRow()]);
  const advanceDraft = advanceGetTripAdvanceDraft(trip.tripCode);
  const advSections = advanceDraft?.sections ?? initAdvSections(trip);
  const advanceModalExtraItems = (advanceDraft?.extraItems ?? []).filter(item => item.checked);

  useEffect(() => {
    const status = expenseGetClientTripStatus(trip.tripCode);
    if (status !== undefined) setLocalStatus(status);
    const draft = expenseGetTripExpenseDraft(trip.tripCode);
    if (draft) {
      const clonedDraft = cloneExpenseSections(draft);
      setSavedSections(clonedDraft);
      setSections(cloneExpenseSections(clonedDraft));
    }
  }, [trip.tripCode]);

  const persistExpenseDraftToClient = (nextSections: ExpenseSections) => {
    expenseSetTripExpenseDraft(trip.tripCode, nextSections);
    const total = Object.values(nextSections)
      .flat()
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.actCost, 0);
    expenseSetTripExpenseTotal(trip.tripCode, total);
  };

  const handleEnterEdit = () => {
    setSections(cloneExpenseSections(savedSections));
    setMode("edit");
  };

  const handleCancelEdit = () => {
    setSections(cloneExpenseSections(savedSections));
    setShowExtraExpenseModal(false);
    setExtraExpenseModalRows([createEmptyExtraExpenseModalRow()]);
    setMode("view");
  };

  const handleSave = () => {
    const nextSections = cloneExpenseSections(sections);
    setSavedSections(nextSections);
    persistExpenseDraftToClient(nextSections);
    setMode("view");
  };

  const handleApprove = () => {
    const nextSections = cloneExpenseSections(sections);
    setSavedSections(nextSections);
    persistExpenseDraftToClient(nextSections);
    setLocalStatus("Completed");
    expenseMarkTripStatus(trip.tripCode, "Completed");
    expenseRequestCompletedTab();
    router.push("/payment/expenses");
  };

  const toggleItem = (section: SectionKey, id: string) => {
    setSections(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, checked: !item.checked } : item),
    }));
  };

  const setCostUnit = (section: SectionKey, id: string, value: string) => {
    const nextValue = Number(String(value).replace(/,/g, "") || 0);
    setSections(prev => ({
      ...prev,
      [section]: prev[section].map(item => {
        if (item.id !== id) return item;
        const actCost = item.costType === "Person" ? nextValue * item.actPax : nextValue;
        return { ...item, costUnit: nextValue, actCost };
      }),
    }));
  };

  const setActPax = (section: SectionKey, id: string, value: string) => {
    const nextValue = Number(value || 0);
    setSections(prev => ({
      ...prev,
      [section]: prev[section].map(item => {
        if (item.id !== id) return item;
        const actCost = item.costType === "Person" ? item.costUnit * nextValue : item.actCost;
        return { ...item, actPax: nextValue, actCost };
      }),
    }));
  };

  const setExpense = (section: SectionKey, id: string, value: string) => {
    const nextValue = Number(String(value).replace(/,/g, "") || 0);
    setSections(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, actCost: nextValue } : item),
    }));
  };

  const openExtraExpenseModal = () => {
    setExtraExpenseModalRows([createEmptyExtraExpenseModalRow()]);
    setShowExtraExpenseModal(true);
  };

  const closeExtraExpenseModal = () => {
    setShowExtraExpenseModal(false);
    setExtraExpenseModalRows([createEmptyExtraExpenseModalRow()]);
  };

  const confirmExtraExpenseModal = () => {
    const validRows = extraExpenseModalRows.filter(row => row.sourceOtherId && Number(String(row.costUnit).replace(/,/g, "") || 0) > 0);
    if (validRows.length === 0) return;

    const newItems: ExpenseItem[] = validRows.flatMap(row => {
      const source = sections.other.find(item => item.id === row.sourceOtherId);
      if (!source) return [];
      const nextCostUnit = Number(String(row.costUnit).replace(/,/g, "") || 0);
      const nextName = row.remark.trim() ? `${source.name} — ${row.remark.trim()}` : source.name;
      const nextActCost = source.costType === "Person" ? nextCostUnit * source.actPax : nextCostUnit;
      return [{
        id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: nextName,
        payment: source.payment,
        supplier: source.supplier,
        costType: source.costType,
        costUnit: nextCostUnit,
        actPax: source.actPax,
        actCost: nextActCost,
        checked: true,
      }];
    });

    if (newItems.length === 0) return;

    setSections(prev => ({
      ...prev,
      extra: [...prev.extra, ...newItems],
    }));
    closeExtraExpenseModal();
  };

  const deleteExtraExpenseRow = (id: string) => {
    setSections(prev => ({
      ...prev,
      extra: prev.extra.filter(item => item.id !== id),
    }));
  };

  const guideSource = mode === "view" ? sections.guide.filter(item => item.checked) : sections.guide;
  const guideRows: SectionTableRow[] = guideSource.map(item => {
    const adv = advSections.guide.find(advItem => advItem.id === item.id);
    return {
      id: item.id,
      section: "guide",
      item: item.name,
      payment: item.payment,
      costType: item.costType,
      costUnit: item.costUnit,
      advPax: adv?.pax ?? null,
      advCost: adv?.advCost ?? null,
      actPax: item.actPax,
      expense: item.actCost,
      balance: adv ? item.actCost - adv.advCost : null,
      checked: item.checked,
    };
  });

  const vehicleSource = mode === "view" ? sections.vehicle.filter(item => item.checked) : sections.vehicle;
  const vehicleRows: SectionTableRow[] = vehicleSource.map(item => {
    const adv = advSections.vehicle.find(advItem => advItem.id === item.id);
    return {
      id: item.id,
      section: "vehicle",
      item: item.name,
      payment: item.payment,
      costType: item.costType,
      costUnit: item.costUnit,
      advPax: adv?.pax ?? null,
      advCost: adv?.advCost ?? null,
      actPax: item.actPax,
      expense: item.actCost,
      balance: adv ? item.actCost - adv.advCost : null,
      checked: item.checked,
    };
  });

  const otherSource = mode === "view" ? sections.other.filter(item => item.checked) : sections.other;
  const otherRows: SectionTableRow[] = otherSource.map(item => {
    const adv = advSections.other.find(advItem => advItem.id === item.id);
    const { headline, remark } = splitRemark(item.name);
    const balance = adv ? item.actCost - adv.advCost : null;
    return {
      id: item.id,
      section: "other",
      item: headline,
      remark,
      option: "-",
      payment: item.payment,
      costType: item.costType === "Fix" && adv ? `Fix (0 - ${adv.pax} Pax)` : item.costType,
      costUnit: item.costUnit,
      advPax: adv?.pax ?? null,
      advCost: adv?.advCost ?? null,
      actPax: item.actPax,
      expense: item.actCost,
      balance,
      checked: item.checked,
    };
  });

  const allowanceSource = mode === "view" ? sections.allowance.filter(item => item.checked) : sections.allowance;
  const allowanceRows: SectionTableRow[] = allowanceSource.map(item => {
    const adv = advSections.allowance.find(advItem => advItem.id === item.id);
    return {
      id: item.id,
      section: "allowance",
      item: item.name,
      payment: item.payment,
      costType: item.costType,
      costUnit: item.costUnit,
      advPax: adv?.pax ?? null,
      advCost: adv?.advCost ?? null,
      actPax: item.actPax,
      expense: item.actCost,
      balance: adv ? item.actCost - adv.advCost : null,
      checked: item.checked,
    };
  });

  const extraAdvanceRows: SectionTableRow[] = advanceModalExtraItems.map(item => ({
    id: item.id,
    section: "extra" as const,
    item: item.name,
    payment: "Cash" as const,
    costType: item.costType,
    costUnit: item.costUnit,
    advPax: item.pax,
    advCost: item.advCost,
    actPax: item.actPax,
    expense: item.actCost,
    balance: item.actCost - item.advCost,
  }));

  const extraExpenseSource = mode === "view" ? sections.extra.filter(item => item.checked) : sections.extra;
  const extraExpenseRows: SectionTableRow[] = extraExpenseSource.map(item => {
    return {
      id: item.id,
      section: "extra",
      item: item.name,
      remark: "",
      option: "-",
      payment: item.payment,
      costType: item.costType,
      costUnit: item.costUnit,
      advPax: null,
      advCost: null,
      actPax: item.actPax,
      expense: item.actCost,
      balance: null,
      checked: item.checked,
    };
  });

  const extraExpenseCheckedCount = sections.extra.filter(item => item.checked).length;
  const supplierVehicleRows = vehicleRows.filter((row) => {
    const item = sections.vehicle.find((vehicleItem) => vehicleItem.id === row.id);
    return item?.supplier !== "-";
  });
  const ownVehicleRows = vehicleRows.filter((row) => {
    const item = sections.vehicle.find((vehicleItem) => vehicleItem.id === row.id);
    return item?.supplier === "-";
  });
  const vehicleSupplier = sections.vehicle.find(item => item.supplier !== "-")?.supplier;
  const hasVehicleSection = supplierVehicleRows.length > 0 || ownVehicleRows.length > 0;
  const sectionCards = [
    { key: "guide", title: "Guide", icon: "👥", rows: guideRows, supplier: undefined, showAdvanceColumns: undefined, showBalance: undefined },
    { key: "other", title: "Other Expense", icon: "🏷", rows: otherRows, supplier: undefined, showAdvanceColumns: undefined, showBalance: undefined },
    { key: "allowance", title: "Allowance", icon: "💸", rows: allowanceRows, supplier: undefined, showAdvanceColumns: undefined, showBalance: undefined },
  ].filter(section => section.rows.length > 0);

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span>Payment</span><span>›</span>
              <Link href="/payment/expenses" className="hover:text-blue-500">Expense</Link>
              <span>›</span>
              <span className="font-semibold text-blue-600">{mode === "view" ? "View" : "Edit"}</span>
            </div>
            <div className="inline-flex justify-start items-start gap-3">
              <button className="px-4 py-2 bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] inline-flex flex-col justify-start items-start gap-2.5 hover:bg-gray-50">
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2.48 8.9H21.51V21.5H2.48V8.9Z" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 15V3.62" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.65 5.85L12 2.5L15.35 5.85" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="w-[53px] h-6 justify-start text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">Export</div>
                  </div>
                  <div className="flex justify-center items-end gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 9L12 15L18 9" stroke="#2A2A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>
              {mode === "view" ? (
                <>
                  <div className="w-10 h-0 origin-top-left rotate-90 outline -outline-offset-[0.5px] outline-[#d9d9d9]" />
                  <div className="flex justify-start items-center gap-6">
                    <button
                      onClick={() => router.push("/payment/expenses")}
                      className="px-5 py-2 bg-white rounded-[100px] outline -outline-offset-1 outline-[#265ed6] flex justify-center items-center gap-2 hover:bg-blue-50"
                    >
                      <div className="text-center justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Close</div>
                    </button>
                    <button onClick={handleEnterEdit} className="px-5 py-2 bg-[#265ed6] rounded-[100px] flex justify-center items-center gap-2 hover:bg-[#1f4fc0]">
                      <div className="flex justify-center items-end gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 22H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M13.47 5.54L18.46 10.53" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16.02 3C17.41 1.61 19.66 1.61 21.05 3C22.44 4.39 22.44 6.64 21.05 8.03L7.54 21.54L2 22L2.46 16.46L16.02 3Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-center justify-start text-white text-base font-medium leading-6 tracking-tight">Edit</div>
                      </div>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <PaxBar paxAdv={trip.paxAdv} checkedIn={trip.checkedIn} noShow={trip.noShow} />
          <ProgramInfoCard trip={trip} status={localStatus} />

          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px", alignItems: "start" }}>
            <div className="self-stretch rounded-bl-2xl rounded-br-2xl inline-flex flex-col justify-start items-center overflow-hidden bg-white border border-[#E7E7E9]">
              <div className="self-stretch p-6 bg-white rounded-tl-2xl rounded-tr-2xl border-b border-[#265ed6] flex flex-col justify-start items-start gap-6 overflow-hidden">
                <div className="self-stretch inline-flex justify-start items-center gap-3">
                  <span className="text-[#265ed6] text-xl">🧾</span>
                  <div className="flex-1 flex justify-start items-center gap-3">
                    <div className="justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Expense</div>
                  </div>
                </div>
              </div>
              {sectionCards.filter((section) => section.key === "guide").map((section) => (
                <div key={section.key} className="w-full">
                  {mode === "view" ? <GuideSectionTable rows={section.rows} /> : (
                    <EditableExpenseSectionTable
                      title={section.title.includes("Vehicle") ? "Vehicle Cost" : section.title}
                      rows={section.rows}
                      supplier={section.supplier}
                      onToggle={toggleItem}
                      onSetCostUnit={setCostUnit}
                      onSetActPax={setActPax}
                      onSetExpense={setExpense}
                    />
                  )}
                  {(hasVehicleSection || sectionCards.some((item) => item.key !== "guide") || (mode === "view" && extraExpenseCheckedCount > 0) || (mode === "edit" && sections.extra.length > 0) || extraAdvanceRows.length > 0)
                    ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ))}
              {hasVehicleSection ? (
                <div className="w-full">
                  <div className="w-full p-6 bg-white flex flex-col gap-3">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <span className="text-[#265ed6] text-lg">🚌</span>
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Vehicle Cost</div>
                    </div>
                    {mode === "view" ? (
                      <div className="w-full flex flex-col gap-3">
                        {supplierVehicleRows.length > 0 ? <VehicleSectionTable rows={supplierVehicleRows} supplier={vehicleSupplier} title="Supplier Cost" /> : null}
                        {ownVehicleRows.length > 0 ? <VehicleSectionTable rows={ownVehicleRows} title="Own Vehicle Cost" /> : null}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        {supplierVehicleRows.length > 0 ? <EditableExpenseSectionTable title="Supplier Cost" rows={supplierVehicleRows} supplier={vehicleSupplier} onToggle={toggleItem} onSetCostUnit={setCostUnit} onSetActPax={setActPax} onSetExpense={setExpense} /> : null}
                        {ownVehicleRows.length > 0 ? <EditableExpenseSectionTable title="Own Vehicle Cost" rows={ownVehicleRows} onToggle={toggleItem} onSetCostUnit={setCostUnit} onSetActPax={setActPax} onSetExpense={setExpense} /> : null}
                      </div>
                    )}
                  </div>
                  {sectionCards.some((section) => section.key !== "guide") || (mode === "view" && extraExpenseCheckedCount > 0) || (mode === "edit" && sections.extra.length > 0) || extraAdvanceRows.length > 0 ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ) : null}
              {sectionCards.filter((section) => section.key !== "guide").map((section, index, arr) => (
                <div key={section.key} className="w-full">
                  {mode === "view" ? (
                    section.key === "other" ? (
                      <OtherExpenseSectionTable rows={section.rows} />
                    ) : (
                      <ExpenseSectionTable
                        title={section.title}
                        icon={section.icon}
                        rows={section.rows}
                        supplier={section.supplier}
                        showAdvanceColumns={section.showAdvanceColumns}
                        showOption={section.title === "Other Expense"}
                        showBalance={section.showBalance}
                      />
                    )
                  ) : (
                    <EditableExpenseSectionTable
                      title={section.title.includes("Vehicle") ? "Vehicle Cost" : section.title}
                      rows={section.rows}
                      supplier={section.supplier}
                      onToggle={toggleItem}
                      onSetCostUnit={setCostUnit}
                      onSetActPax={setActPax}
                      onSetExpense={setExpense}
                    />
                  )}
                  {(index < arr.length - 1 || (mode === "view" && extraExpenseCheckedCount > 0) || (mode === "edit" && sections.extra.length > 0) || extraAdvanceRows.length > 0)
                    ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ))}
              {mode === "view"
                ? (extraExpenseCheckedCount > 0 ? <ExtraExpenseSectionTable rows={extraExpenseRows} /> : null)
                : sections.extra.length > 0 ? (
                <EditableExpenseSectionTable
                  title="Extra Expense"
                  rows={extraExpenseRows}
                  headerAction={(
                    <button
                      type="button"
                      onClick={openExtraExpenseModal}
                      className="px-4 py-2 bg-[#FD5C04] rounded-[100px] inline-flex justify-center items-center gap-2 text-white text-sm font-medium leading-5 tracking-tight hover:bg-[#e65200]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                        <path d="M12 8V16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>Add Extra Expense</span>
                    </button>
                  )}
                  onDeleteRow={deleteExtraExpenseRow}
                  onToggle={toggleItem}
                  onSetCostUnit={setCostUnit}
                  onSetActPax={setActPax}
                  onSetExpense={setExpense}
                />
              ) : (
                <EmptyExtraExpenseSection
                  headerAction={(
                    <button
                      type="button"
                      onClick={openExtraExpenseModal}
                      className="px-4 py-2 bg-[#FD5C04] rounded-[100px] inline-flex justify-center items-center gap-2 text-white text-sm font-medium leading-5 tracking-tight hover:bg-[#e65200]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                        <path d="M12 8V16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>Add Extra Expense</span>
                    </button>
                  )}
                />
              )}
              {extraAdvanceRows.length > 0 ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
              {extraAdvanceRows.length > 0 ? (
                <ExpenseSectionTable
                  title="Extra Advance"
                  icon="📎"
                  rows={extraAdvanceRows}
                  showAdvanceColumns
                  showBalance
                />
              ) : null}
            </div>

            <div className="sticky top-4">
              <SummaryCard sections={sections} advSections={advSections} extraAdvanceRows={extraAdvanceRows} />
            </div>
          </div>
        </main>

        {mode === "edit" ? (
          <div className="sticky bottom-4 z-30 mx-6 mb-6 p-6 bg-white rounded-2xl border border-[#E7E7E9] shadow-[0_8px_24px_rgba(0,0,0,0.08)] inline-flex flex-col justify-center items-end gap-2.5 overflow-hidden">
            <div className="self-stretch inline-flex justify-end items-start gap-2.5">
              <button
                onClick={handleCancelEdit}
                className="px-5 py-2 bg-white rounded-[100px] border border-[#265ed6] text-[#265ed6] text-base font-medium leading-6 tracking-tight"
              >
                Cancel
              </button>
              <div className="flex-1 flex justify-end items-center gap-4">
                {localStatus !== "Completed" ? (
                  <button
                    onClick={handleApprove}
                    className="px-5 py-2 bg-[#3ad29f] rounded-[100px] inline-flex justify-center items-center gap-2 text-white text-base font-medium leading-6 tracking-tight"
                  >
                    Approve
                  </button>
                ) : null}
                <button
                  onClick={handleSave}
                  className={`px-5 py-2 rounded-[100px] inline-flex justify-center items-center gap-2 text-white text-base font-medium leading-6 tracking-tight ${localStatus === "Completed" ? "bg-[#3ad29f]" : "bg-[#265ed6]"}`}
                >
                  {localStatus === "Completed" ? "Approve" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <AddExtraExpenseModal
          open={showExtraExpenseModal}
          rows={extraExpenseModalRows}
          otherExpenseItems={sections.other}
          onRowsChange={setExtraExpenseModalRows}
          onClose={closeExtraExpenseModal}
          onConfirm={confirmExtraExpenseModal}
        />

        <Footer />
      </div>
    </div>
  );
}
