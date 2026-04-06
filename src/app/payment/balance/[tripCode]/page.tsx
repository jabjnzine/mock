"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { AttachmentSlipModal } from "../../components/AttachmentSlipModal";
import {
  AdvanceSections,
  ExpenseItem,
  ExpenseSections,
  INIT_TRIPS,
  PaymentType,
  SectionKey,
  initAdvSections,
  initExpSections,
} from "../../lib/payment-data";
import { advanceGetTripAdvanceDraft } from "../../lib/advance-client-state";
import { expenseGetClientTripStatus, expenseGetTripExpenseDraft, expenseGetTripSlipPreviewSrc, expenseMarkTripStatus, expenseSetTripExpenseDraft, expenseSetTripExpenseTotal, expenseSetTripSlipPreviewSrc } from "../../lib/expense-client-state";
import { formatPaymentMoney, PAYMENT_BANK_COLOR } from "../../components/payment-table-styles";

const formatMoney = (value: number) => formatPaymentMoney(Number(value || 0));

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
};

function cloneExpenseSections(sections: ExpenseSections): ExpenseSections {
  return {
    guide: sections.guide.map((item) => ({ ...item })),
    vehicle: sections.vehicle.map((item) => ({ ...item })),
    other: sections.other.map((item) => ({ ...item })),
    allowance: sections.allowance.map((item) => ({ ...item })),
    extra: sections.extra.map((item) => ({ ...item })),
  };
}

function splitRemark(name: string) {
  const [headline, remark] = name.split("—").map((part) => part.trim());
  return { headline, remark };
}

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
          <div className="self-stretch inline-flex justify-start items-start gap-4">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-[#1a1a1a] text-[28px] font-normal font-['Kanit'] leading-10">{card.value}</div>
              <div className="justify-start text-[#1a1a1a] text-base font-normal font-['Kanit'] leading-6">{card.label}</div>
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

function AttachmentPaperclipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path d="M8.99997 16.9999L15.5 10.4999C16.3284 9.6715 16.3284 8.32835 15.5 7.49993C14.6715 6.6715 13.3284 6.6715 12.5 7.49993L5.99997 13.9999C4.61926 15.3806 4.61926 17.6192 5.99997 18.9999C7.38068 20.3806 9.61926 20.3806 11 18.9999L17.5 12.4999C19.7091 10.2908 19.7091 6.70907 17.5 4.49993C15.2908 2.29079 11.7091 2.29079 9.49997 4.49993L2.99997 10.9999" stroke="#265ED6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AttachmentAddSlipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[100px] border border-[#265ed6] bg-white px-4 py-2 text-sm font-medium text-[#265ed6] hover:bg-blue-50"
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add Slip
    </button>
  );
}

function ExpenseSectionTable({
  title,
  icon,
  rows,
  supplier,
  showOption = false,
  showAdvanceColumns = false,
  showAdvancePax = showAdvanceColumns,
  showBalance = false,
  editableExpense = false,
  onSetExpense,
}: {
  title: string;
  icon: string;
  rows: SectionTableRow[];
  supplier?: string;
  showOption?: boolean;
  showAdvanceColumns?: boolean;
  showAdvancePax?: boolean;
  showBalance?: boolean;
  editableExpense?: boolean;
  onSetExpense?: (section: SectionKey, id: string, value: string) => void;
}) {
  if (rows.length === 0) return null;

  const totalAdvance = rows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const totalExpense = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = rows.reduce((sum, row) => sum + Number(row.balance || 0), 0);
  const isGuide = title === "Guide";
  const isVehicle = ["Vehicle Cost", "Supplier Cost", "Own Vehicle Cost"].includes(title);
  const showCostType = !isVehicle;
  const showActPax = !isVehicle;
  const totalLabelColSpan =
    showOption ? 6 : isVehicle ? (showAdvancePax ? 4 : 5) : 5;
  const isSupplierTable = title === "Supplier Cost";
  const totalLabelWidth = isSupplierTable ? "w-[calc(100%-320px)]" : "w-[calc(100%-460px)]";
  const resolveSupplierVehicle = (value: string) => {
    const [left, right] = value.split("—").map((part) => part.trim());
    return {
      supplierName: supplier ?? left ?? "-",
      vehicleName: right || value,
    };
  };

  if (isVehicle && !showAdvancePax) {
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
                <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Payment</div></div>
                {!isSupplierTable ? <div className="w-[120px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-start items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost Type</div></div> : null}
                <div className="w-[133px] h-11 p-2 bg-[#142b41] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Cost</div></div>
                {!isSupplierTable ? <div className="w-[70px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Pax</div></div> : null}
                <div className="w-[110px] h-11 p-2 bg-[#265ed6] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Adv. Cost</div></div>
                {!isSupplierTable ? <div className="w-[70px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-center items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">AdtPax</div></div> : null}
                <div className="w-[110px] h-11 p-2 bg-[#fd5c04] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Expense</div></div>
                <div className="w-[100px] h-11 p-2 bg-[#1cb579] border-l border-white flex justify-end items-center gap-2.5 overflow-hidden"><div className="justify-start text-white text-base font-medium leading-6 tracking-tight">Balance</div></div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-stretch">
              {rows.map((row, index) => (
                <div key={row.id} className="self-stretch inline-flex justify-start items-start">
                  <div className={`w-16 h-14 p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} flex justify-center items-center gap-1 overflow-hidden`}><div className="w-[34px] flex justify-start items-center gap-1"><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{index + 1}</div></div></div>
                  {isSupplierTable ? <div className={`w-[222px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{resolveSupplierVehicle(row.item).supplierName}</div></div> : null}
                  <div className={`flex-1 h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{isSupplierTable ? resolveSupplierVehicle(row.item).vehicleName : "-"}</div></div>
                  {!isSupplierTable ? <div className={`flex-1 h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] inline-flex flex-col justify-center items-start gap-1 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.item}</div></div> : null}
                  <div className={`w-[120px] h-14 p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.payment}</div></div>
                  {!isSupplierTable ? <div className={`w-[120px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-start items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.costType}</div></div> : null}
                  <div className={`w-[133px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.costUnit)}</div></div>
                  {!isSupplierTable ? <div className={`w-[70px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advPax ?? "-"}</div></div> : null}
                  <div className={`w-[110px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.advCost != null ? formatMoney(row.advCost) : "-"}</div></div>
                  {!isSupplierTable ? <div className={`w-[70px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{row.actPax}</div></div> : null}
                  <div className={`w-[110px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}>
                    {editableExpense ? (
                      <input
                        value={String(row.expense)}
                        onChange={(e) => onSetExpense?.(row.section, row.id, e.target.value)}
                        className="w-full rounded-md border border-[#FFDABF] bg-white px-2 py-1 text-right text-sm text-[#2a2a2a] outline-none"
                      />
                    ) : (
                      <div className="justify-start text-[#2a2a2a] text-base font-normal leading-6 tracking-tight">{formatMoney(row.expense)}</div>
                    )}
                  </div>
                  <div className={`w-[100px] h-[62px] p-2 ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} border-l border-[#d9d9d9] flex justify-end items-center gap-2.5 overflow-hidden`}><div className="justify-start text-[#1cb579] text-base font-normal leading-6 tracking-tight">{row.balance != null ? formatMoney(row.balance) : "0.00"}</div></div>
                </div>
              ))}
            </div>
            <div className="self-stretch inline-flex justify-start items-start">
              <div className={`${totalLabelWidth} h-12 relative bg-white border-t border-[#d9d9d9]`}><div className="left-[15px] top-[12px] absolute justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">Total</div></div>
              {!isSupplierTable ? <div className="w-[70px] h-12 px-2 py-3 bg-white border-t border-[#d9d9d9]" /> : null}
              <div className="w-[110px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5"><div className="text-right justify-start text-[#265ed6] text-base font-medium leading-6 tracking-tight">{formatMoney(totalAdvance)}</div></div>
              {!isSupplierTable ? <div className="w-[70px] h-12 px-2 py-3 bg-white border-t border-[#d9d9d9]" /> : null}
              <div className="w-[110px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5"><div className="text-right justify-start text-[#fd5c04] text-base font-medium leading-6 tracking-tight">{formatMoney(totalExpense)}</div></div>
              <div className="w-[100px] px-2 py-3 bg-white border-t border-[#d9d9d9] flex justify-end items-center gap-2.5"><div className="text-right justify-start text-[#1cb579] text-base font-medium leading-6 tracking-tight">{totalBalance === 0 ? "0.00" : formatMoney(totalBalance)}</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <colgroup>
            <col className="w-16" />
            <col style={{ width: "100%" }} />
            {showOption ? <col className="w-[96px]" /> : null}
            <col className="w-[90px]" />
            {showCostType ? <col className="w-[120px]" /> : null}
            <col className="w-[117px]" />
            {showAdvanceColumns && showAdvancePax ? <col className="w-[70px]" /> : null}
            {showAdvanceColumns ? <col className="w-[110px]" /> : null}
            {showActPax ? <col className="w-[70px]" /> : null}
            <col className="w-[110px]" />
            {showBalance ? <col className="w-[100px]" /> : null}
          </colgroup>
          <thead>
            <tr className="bg-[#142b41]">
              <th className="p-2 text-left text-white text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">#</th>
              <th className="p-2 border-l border-white text-left text-white text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{title === "Guide" ? "Guide Items" : isVehicle ? "Vehicle" : "Items"}</th>
              {showOption ? <th className="p-2 border-l border-white text-left text-white text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">Option</th> : null}
              <th className="p-2 border-l border-white text-left text-white text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">Payment</th>
              {showCostType ? <th className="p-2 border-l border-white text-left text-white text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">Cost Type</th> : null}
              <th className="p-2 border-l border-white text-right text-white text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">Cost</th>
              {showAdvanceColumns && showAdvancePax ? <th className="p-2 border-l border-white text-right text-white text-base font-medium bg-[#265ed6] whitespace-nowrap overflow-hidden text-ellipsis">Pax</th> : null}
              {showAdvanceColumns ? <th className="p-2 border-l border-white text-right text-white text-base font-medium bg-[#265ed6] whitespace-nowrap overflow-hidden text-ellipsis">Adv. Cost</th> : null}
              {showActPax ? <th className="p-2 border-l border-white text-right text-white text-base font-medium bg-[#fd5c04] whitespace-nowrap overflow-hidden text-ellipsis">ActPax</th> : null}
              <th className="p-2 border-l border-white text-right text-white text-base font-medium bg-[#fd5c04] whitespace-nowrap overflow-hidden text-ellipsis">Expense</th>
              {showBalance ? <th className="p-2 border-l border-white text-right text-white text-base font-medium bg-[#1cb579] whitespace-nowrap overflow-hidden text-ellipsis">Balance</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]";
              return (
                <tr key={row.id} className={`${rowBg} border-b border-[#E7E7E9]`}>
                  <td className="p-2 align-top text-[#2a2a2a] text-sm">{index + 1}</td>
                  <td className="p-2 border-l border-[#d9d9d9] align-top overflow-hidden">
                    <div className="text-[#2a2a2a] text-sm whitespace-nowrap overflow-hidden text-ellipsis">{row.item}</div>
                    {row.remark ? <div className="text-[#676363] text-xs mt-1">Remark : {row.remark}</div> : null}
                  </td>
                  {showOption ? <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.option ?? "-"}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.payment}</td>
                  {showCostType ? <td className="p-2 border-l border-[#d9d9d9] align-top text-[#2a2a2a] text-sm">{row.costType}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{formatMoney(row.costUnit)}</td>
                  {showAdvanceColumns && showAdvancePax ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.advPax ?? "-"}</td> : null}
                  {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.advCost != null ? formatMoney(row.advCost) : "-"}</td> : null}
                  {showActPax ? <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">{row.actPax}</td> : null}
                  <td className="p-2 border-l border-[#d9d9d9] align-top text-right text-[#2a2a2a] text-sm">
                    {editableExpense ? (
                      <input
                        value={String(row.expense)}
                        onChange={(e) => onSetExpense?.(row.section, row.id, e.target.value)}
                        className="w-full rounded-md border border-[#FFDABF] bg-white px-2 py-1 text-right text-sm text-[#2a2a2a] outline-none"
                      />
                    ) : (
                      formatMoney(row.expense)
                    )}
                  </td>
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
              {showAdvanceColumns && showAdvancePax ? <td className="p-2 border-l border-[#d9d9d9]" /> : null}
              {showAdvanceColumns ? <td className="p-2 border-l border-[#d9d9d9] text-right text-[#265ed6] text-base font-medium">{formatMoney(totalAdvance)}</td> : null}
              {showActPax ? <td className="p-2 border-l border-[#d9d9d9]" /> : null}
              <td className="p-2 border-l border-[#d9d9d9] text-right text-[#fd5c04] text-base font-medium">{formatMoney(totalExpense)}</td>
                    {showBalance ? <td className="p-2 border-l border-[#d9d9d9] text-right text-[#2a2a2a] text-base font-medium">{totalBalance === 0 ? "0.00" : formatMoney(totalBalance)}</td> : null}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ rows }: { rows: SectionTableRow[] }) {
  const totalAdvance = rows.reduce((sum, row) => sum + Number(row.advCost || 0), 0);
  const totalActual = rows.reduce((sum, row) => sum + Number(row.expense || 0), 0);
  const totalBalance = totalAdvance - totalActual;
  const balanceTextColor =
    totalBalance < 0 ? "text-[#d91616]" : totalBalance > 0 ? "text-[#2a2a2a]" : "text-[#2a2a2a]";
  const balanceHelper =
    totalBalance < 0
      ? `Company pays additional ฿${formatMoney(Math.abs(totalBalance))}`
      : totalBalance > 0
        ? `Refund to company ฿${formatMoney(totalBalance)}`
        : "Settled balance ฿0.00";

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E9] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E7E7E9] text-[#265ed6] text-sm font-bold">Summary</div>
      <div className="px-5 py-4 space-y-4 text-sm">
        <div className="flex items-center justify-between text-[#2a2a2a]">
          <span>Advance Paid</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#f8f8f8] text-[#265ed6] font-bold min-w-[116px] text-right">{`฿${formatMoney(totalAdvance)}`}</span>
        </div>
        <div className="flex items-center justify-between text-[#2a2a2a]">
          <span>Actual Expense</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#f8f8f8] text-[#fd8a2b] font-bold min-w-[116px] text-right">{`฿${formatMoney(totalActual)}`}</span>
        </div>
        <div className="border-t border-dashed border-[#E7E7E9] pt-4">
          <div className="flex items-center justify-between text-[#2a2a2a]">
            <span>Balance</span>
            <span className={`px-3 py-1.5 rounded-lg bg-[#eaf7ea] font-bold min-w-[116px] text-right ${balanceTextColor}`}>
              {`฿${totalBalance < 0 ? `-${formatMoney(Math.abs(totalBalance))}` : formatMoney(totalBalance)}`}
            </span>
          </div>
          <div className="mt-2 text-sm text-[#9b9b9b]">{balanceHelper}</div>
        </div>
      </div>
    </div>
  );
}

export default function BalanceDetailPage({ params }: { params: Promise<{ tripCode: string }> }) {
  const { tripCode } = use(params);
  const router = useRouter();
  const trip = INIT_TRIPS.find((t) => t.tripCode === tripCode);

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

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [sections, setSections] = useState<ExpenseSections>(cloneExpenseSections(initExpSections(trip)));
  const [savedSections, setSavedSections] = useState<ExpenseSections>(cloneExpenseSections(initExpSections(trip)));
  const [localStatus, setLocalStatus] = useState(trip.status);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipPreviewSrc, setSlipPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    const status = expenseGetClientTripStatus(trip.tripCode);
    if (status !== undefined) setLocalStatus(status);
    const draft = expenseGetTripExpenseDraft(trip.tripCode);
    if (draft) {
      const clonedDraft = cloneExpenseSections(draft);
      setSections(clonedDraft);
      setSavedSections(cloneExpenseSections(clonedDraft));
    }
    const slipSrc = expenseGetTripSlipPreviewSrc(trip.tripCode);
    setSlipPreviewSrc(slipSrc !== undefined ? slipSrc : null);
  }, [trip.tripCode]);

  const handleEnterEdit = () => {
    setSections(cloneExpenseSections(savedSections));
    setMode("edit");
  };

  const handleCancelEdit = () => {
    setSections(cloneExpenseSections(savedSections));
    setMode("view");
  };

  const handleSave = () => {
    setSavedSections(cloneExpenseSections(sections));
    expenseSetTripExpenseDraft(trip.tripCode, sections);
    expenseSetTripExpenseTotal(
      trip.tripCode,
      Object.values(sections).flat().filter((item) => item.checked).reduce((sum, item) => sum + item.actCost, 0),
    );
    setMode("view");
  };

  const handleApprove = () => {
    setSavedSections(cloneExpenseSections(sections));
    expenseSetTripExpenseDraft(trip.tripCode, sections);
    expenseSetTripExpenseTotal(
      trip.tripCode,
      Object.values(sections).flat().filter((item) => item.checked).reduce((sum, item) => sum + item.actCost, 0),
    );
    setLocalStatus("Completed");
    expenseMarkTripStatus(trip.tripCode, "Completed");
    setMode("view");
    router.push("/payment/balance");
  };

  const setExpense = (section: SectionKey, id: string, value: string) => {
    const nextExpense = Number(String(value).replace(/,/g, "") || 0);
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...item, actCost: nextExpense } : item)),
    }));
  };

  const advanceDraft = advanceGetTripAdvanceDraft(trip.tripCode);
  const advSections = advanceDraft?.sections ?? initAdvSections(trip);
  const advanceModalExtraItems = (advanceDraft?.extraItems ?? []).filter((item) => item.checked);

  const cashOnly = (items: ExpenseItem[]) => items.filter((item) => item.checked && item.payment === "Cash");

  const guideRows: SectionTableRow[] = cashOnly(sections.guide).map((item) => {
    const adv = advSections.guide.find((advItem) => advItem.id === item.id);
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
    };
  });

  const vehicleRows: SectionTableRow[] = cashOnly(sections.vehicle).map((item) => {
    const adv = advSections.vehicle.find((advItem) => advItem.id === item.id);
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
    };
  });

  const otherRows: SectionTableRow[] = cashOnly(sections.other).map((item) => {
    const adv = advSections.other.find((advItem) => advItem.id === item.id);
    const { headline, remark } = splitRemark(item.name);
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
      balance: adv ? item.actCost - adv.advCost : null,
    };
  });

  const allowanceRows: SectionTableRow[] = cashOnly(sections.allowance).map((item) => {
    const adv = advSections.allowance.find((advItem) => advItem.id === item.id);
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
    };
  });

  const extraAdvanceRows: SectionTableRow[] = advanceModalExtraItems.map((item) => ({
    id: item.id,
    section: "extra",
    item: item.name,
    payment: "Cash",
    costType: item.costType,
    costUnit: item.costUnit,
    advPax: item.pax,
    advCost: item.advCost,
    actPax: item.actPax,
    expense: item.actCost,
    balance: item.actCost - item.advCost,
  }));
  const extraCostRows: SectionTableRow[] = cashOnly(sections.extra).map((item) => ({
    id: item.id,
    section: "extra",
    item: item.name,
    option: "-",
    payment: item.payment,
    costType: item.costType,
    costUnit: item.costUnit,
    advPax: null,
    advCost: null,
    actPax: item.actPax,
    expense: item.actCost,
    balance: null,
  }));

  const supplierVehicleRows = vehicleRows.filter((row) => {
    const item = sections.vehicle.find((vehicleItem) => vehicleItem.id === row.id);
    return item?.payment === "Cash" && item.supplier !== "-";
  });
  const ownVehicleRows = vehicleRows.filter((row) => {
    const item = sections.vehicle.find((vehicleItem) => vehicleItem.id === row.id);
    return item?.payment === "Cash" && item.supplier === "-";
  });
  const supplierVehicleName =
    sections.vehicle.find((item) => item.payment === "Cash" && item.supplier !== "-")?.supplier;
  const hasVehicleSection = supplierVehicleRows.length > 0 || ownVehicleRows.length > 0;
  const sectionCards = [
    { key: "guide", title: "Guide", icon: "👥", rows: guideRows, supplier: undefined, showAdvanceColumns: true, showAdvancePax: undefined, showBalance: true },
    { key: "other", title: "Other Expense", icon: "🏷", rows: otherRows, supplier: undefined, showOption: true, showAdvanceColumns: true, showAdvancePax: undefined, showBalance: true },
    { key: "allowance", title: "Allowance", icon: "💸", rows: allowanceRows, supplier: undefined, showAdvanceColumns: true, showAdvancePax: undefined, showBalance: true },
    { key: "extra-cost", title: "Extra Cost", icon: "⭐", rows: extraCostRows, supplier: undefined, showOption: true, showAdvanceColumns: false, showAdvancePax: undefined, showBalance: false },
    { key: "extra-advance", title: "Extra Advance", icon: "📎", rows: extraAdvanceRows, supplier: undefined, showAdvanceColumns: true, showAdvancePax: undefined, showBalance: true },
  ].filter((section) => section.rows.length > 0);
  const summaryRows = sectionCards.flatMap((section) => section.rows);

  return (
    <div className="flex min-h-screen font-['IBM_Plex_Sans_Thai']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-stone-50 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span>Payment</span><span>›</span>
              <Link href="/payment/balance" className="hover:text-blue-500">Balance</Link>
              <span>›</span>
              <span className="font-semibold text-blue-600">{mode === "view" ? "View" : "Edit"}</span>
            </div>
            <div className="flex justify-start items-center gap-6">
              <button className="px-4 py-2 bg-white rounded-lg outline -outline-offset-1 outline-[#d9d9d9] inline-flex items-center gap-2.5 hover:bg-gray-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2.48 8.9H21.51V21.5H2.48V8.9Z" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15V3.62" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.65 5.85L12 2.5L15.35 5.85" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-[#2a2a2a] text-base font-medium leading-6 tracking-tight">Export</div>
              </button>
              {mode === "view" ? (
                <>
                  <button
                    onClick={() => router.push("/payment/balance")}
                    className="px-5 py-2 bg-white rounded-[100px] outline -outline-offset-1 outline-[#265ed6] text-[#265ed6] text-base font-medium leading-6 tracking-tight hover:bg-blue-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEnterEdit}
                    className="px-5 py-2 bg-[#265ed6] rounded-[100px] text-white text-base font-medium leading-6 tracking-tight hover:bg-[#1f4fc0]"
                  >
                    Edit
                  </button>
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
                  <div className="justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Balance</div>
                </div>
              </div>
              {sectionCards.filter((section) => section.key === "guide").map((section) => (
                <div key={section.key} className="w-full">
                  <ExpenseSectionTable
                    title={section.title}
                    icon={section.icon}
                    rows={section.rows}
                    supplier={section.supplier}
                    showOption={section.showOption}
                    showAdvanceColumns={section.showAdvanceColumns}
                    showAdvancePax={section.showAdvancePax}
                    showBalance={section.showBalance}
                    editableExpense={mode === "edit"}
                    onSetExpense={setExpense}
                  />
                  {(hasVehicleSection || sectionCards.some((item) => item.key !== "guide")) ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ))}
              {hasVehicleSection ? (
                <div className="w-full">
                  <div className="w-full p-6 bg-white flex flex-col gap-3">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <span className="text-[#265ed6] text-lg">🚌</span>
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">Vehicle Cost</div>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                      {supplierVehicleRows.length > 0 ? <ExpenseSectionTable title="Supplier Cost" icon="🚌" rows={supplierVehicleRows} supplier={supplierVehicleName} showAdvanceColumns showAdvancePax={false} showBalance editableExpense={mode === "edit"} onSetExpense={setExpense} /> : null}
                      {ownVehicleRows.length > 0 ? <ExpenseSectionTable title="Own Vehicle Cost" icon="🚌" rows={ownVehicleRows} showAdvanceColumns showAdvancePax={false} showBalance editableExpense={mode === "edit"} onSetExpense={setExpense} /> : null}
                    </div>
                  </div>
                  {sectionCards.length > 0 ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ) : null}

              {sectionCards.filter((section) => section.key !== "guide").map((section, index, arr) => (
                <div key={section.key} className="w-full">
                  <ExpenseSectionTable
                    title={section.title}
                    icon={section.icon}
                    rows={section.rows}
                    supplier={section.supplier}
                    showOption={section.showOption}
                    showAdvanceColumns={section.showAdvanceColumns}
                    showAdvancePax={section.showAdvancePax}
                    showBalance={section.showBalance}
                    editableExpense={mode === "edit"}
                    onSetExpense={setExpense}
                  />
                  {index < arr.length - 1 ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                </div>
              ))}
              {localStatus === "Completed" ? (
                <div className="w-full">
                  {sectionCards.length > 0 || hasVehicleSection ? <div className="mx-6 h-px bg-[#d9d9d9]" /> : null}
                  <div
                    data-property-1={slipPreviewSrc ? "View After" : "View Before"}
                    data-property-2="True"
                    data-property-3="Cash"
                    className="w-full p-6 bg-white flex flex-col justify-center items-start gap-3"
                  >
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                        <AttachmentPaperclipIcon />
                      </div>
                      <div className="flex-1 justify-start text-[#265ed6] text-lg font-semibold leading-7 tracking-tight">
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
              ) : null}
            </div>

            <div className="sticky top-4">
              <SummaryCard rows={summaryRows} />
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
                    onClick={handleSave}
                    className="px-5 py-2 bg-[#e3f1ff] rounded-[100px] text-[#265ed6] text-base font-medium leading-6 tracking-tight"
                  >
                    Save
                  </button>
                ) : null}
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 bg-[#3ad29f] rounded-[100px] text-white text-base font-medium leading-6 tracking-tight"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <Footer />
      </div>

      <AttachmentSlipModal
        open={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        trip={trip}
        localStatus={localStatus}
        grandTotal={summaryRows.reduce((sum, row) => sum + Number(row.advCost || 0), 0)}
        onConfirmSuccess={(src) => {
          expenseSetTripSlipPreviewSrc(trip.tripCode, src);
          setSlipPreviewSrc(src);
          setShowSlipModal(false);
        }}
      />
    </div>
  );
}
