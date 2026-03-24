"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import {
  CheckCircleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { getTripDetail, type TripPerson } from "@/app/lib/check-in-trip";
import NoShowModal from "./NoShowModal";
import WarningModal from "./WarningModal";
import LoadingModal from "./LoadingModal";
import SuccessModal from "./SuccessModal";

interface BookingDetailsProps {
  bookingId: string;
  onCancel: () => void;
  onCheckIn: (checkInPax: number) => void;
  /** "excursion" = Trip Code + Vehicle/Personnel/Guide เดี่ยว (Check-in > Excursion > Check In) */
  tripDetailsVariant?: "excursion" | "transport";
  /** เมื่อ true จะแสดงเป็น View อย่างเดียว ไม่แสดงปุ่ม Check-in และ Check-in Control */
  readonly?: boolean;
  /** ใช้ override ค่า Trip Type ที่แสดงบนหัวการ์ด (เช่น ให้ตรงกับ Trip Code ที่เปิดมาจาก View Trip) */
  initialTripType?: string;
  /** ข้อมูลจาก Trip/Booking เมื่อเปิด View จากหน้า View Trip Code ให้แสดง Program, Option ฯลฯ ตรงกับ Trip */
  initialBookingSnapshot?: Partial<BookingData>;
}

interface BookingData {
  bookingNo: string;
  title: string;
  seller: string;
  travelDate: string;
  payment: string;
  option: string;
  tripRound: string;
  tripType: string;
  language: string;
  tripCode: string;
  transportCodePickUp: string;
  transportCodeDropOff: string;
  vehicleDetail: string;
  vehiclePlate: string;
  captain: { name: string; phone: string };
  assistant: { name: string; phone: string };
  assistant2?: { name: string; phone: string };
  guide1: { name: string; phone: string };
  guide2: { name: string; phone: string };
  pickUpVehicle: string;
  pickUpDriver: { name: string; phone: string };
  pickUpGuide1: { name: string; phone: string };
  pickUpGuide2: { name: string; phone: string };
  dropOffVehicle: string;
  dropOffDriver: { name: string; phone: string };
  dropOffGuide1: { name: string; phone: string };
  dropOffGuide2: { name: string; phone: string };
  customerName: string;
  nationality: string;
  email: string;
  phone: string;
  contactMethod: string;
  units: Array<{
    type: string;
    price: number;
    quantity: number;
    kb: number;
    total: number;
  }>;
  meetingPoint: string;
  pickUpLocation: string;
  pickUpAddress: string;
  dropOffPoint: string;
  dropOffRemark: string;
  bookingQuantity: number;
}

/** แสดง tooltip เฉพาะเมื่อข้อความยาวเกินขอบ (overflow) */
function CellWithTooltip({ children, className = "" }: { children: string; className?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const handleMouseEnter = () => {
    if (spanRef.current && spanRef.current.scrollWidth > spanRef.current.clientWidth) {
      setShowTooltip(true);
    }
  };
  const handleMouseLeave = () => setShowTooltip(false);
  return (
    <div className={`relative w-full min-w-0 ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <span ref={spanRef} className="block w-full min-w-0 truncate">
        {children}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-1 max-w-[320px] rounded-lg bg-[#DBEAFE] px-4 py-2 shadow z-[200] pointer-events-none">
          <span className="text-[#78716C] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-4 whitespace-pre-wrap break-words block">
            {children}
          </span>
        </div>
      )}
    </div>
  );
}

const DEFAULT_BOOKING_DATA: BookingData = {
  bookingNo: "TQC417792",
  title: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
  seller: "Klook",
  travelDate: "17/12/2025",
  payment: "Pending",
  option: "Day Trip with Shared Transfer excluding Natio...",
  tripRound: "07:30",
  tripType: "Join In",
  language: "EN",
  tripCode: "EC25Z1PW",
  transportCodePickUp: "TF25A956",
  transportCodeDropOff: "TF25A957",
  vehicleDetail: "Speed Catamaran 2 engines (30)",
  vehiclePlate: "โลมาใจดี NO1",
  captain: { name: "Capt. Trunk", phone: "096-6502747" },
  assistant: { name: "Jane Cooper", phone: "0684 555-0102" },
  assistant2: { name: "Savannah Nguyen", phone: "(629) 555-0129" },
  guide1: { name: "G. Peter", phone: "094-4313995" },
  guide2: { name: "G. ter", phone: "095-4313995" },
  pickUpVehicle: "VAN-Phuket - VAN (10)",
  pickUpDriver: { name: "Anan Chaiyaporn", phone: "081-764-3390" },
  pickUpGuide1: { name: "G. Peter", phone: "094-4313995" },
  pickUpGuide2: { name: "G. ter", phone: "095-4313995" },
  dropOffVehicle: "VAN-Phuket - VAN (10)",
  dropOffDriver: { name: "Anan Chaiyaporn", phone: "081-764-3390" },
  dropOffGuide1: { name: "G. Peter", phone: "094-4313995" },
  dropOffGuide2: { name: "G. ter", phone: "095-4313995" },
  customerName: "Zakenya Crawford",
  nationality: "-",
  email: "jmmlbc64j3cvnh@reply.getyourguide.com",
  phone: "+14042349390",
  contactMethod: "We Chat",
  units: [
    { type: "Person", price: 1500, quantity: 5, kb: 0, total: 7500 },
    { type: "Infant (Default)", price: 0, quantity: 0, kb: 0, total: 0 },
  ],
  meetingPoint: "-",
  pickUpLocation:
    "Hilltop Wellness Resort Phuket, 138 Soi Si Suchat View, Ratsada, Mueang Phuket District, Phuket 83000, Thailand",
  pickUpAddress: "-",
  dropOffPoint: "-",
  dropOffRemark: "-",
  bookingQuantity: 5,
};

const TS0003_BOOKING_DATA: BookingData = {
  ...DEFAULT_BOOKING_DATA,
  bookingNo: "TS0003",
  title: "Damnoen + Buffalo Cafe + Maeklong",
  tripRound: "08:00",
  tripCode: "EC25DM35",
  transportCodePickUp: "EC25DM35",
  transportCodeDropOff: "EC25DM35",
  vehicleDetail: "Bus (35)",
  vehiclePlate: "กข-123",
  captain: { name: "สมชาย มาครั้ง", phone: "089-111-2233" },
  assistant: { name: "", phone: "" },
  assistant2: undefined,
  guide1: { name: "G. Jannie", phone: "080-2093565" },
  guide2: { name: "", phone: "" },
  pickUpVehicle: "Bus (35)",
  dropOffVehicle: "Bus (35)",
  option: "Day Trip",
  customerName: "Damnoen Guest",
  units: [
    { type: "Adult", price: 1500, quantity: 2, kb: 0, total: 3000 },
    { type: "Child", price: 1200, quantity: 2, kb: 0, total: 2400 },
    { type: "Infant", price: 0, quantity: 1, kb: 0, total: 0 },
  ],
  bookingQuantity: 5,
};

export default function BookingDetails({
  bookingId,
  onCancel,
  onCheckIn,
  tripDetailsVariant = "transport",
  readonly = false,
  initialTripType,
  initialBookingSnapshot,
}: BookingDetailsProps) {
  const [expandedSections, setExpandedSections] = useState({
    bookingDetails: true,
    tripDetails: true,
    customerDetails: true,
    unitDetails: true,
    locationDetails: true,
  });

  const baseData: BookingData =
    bookingId === "TS0003" ? TS0003_BOOKING_DATA : DEFAULT_BOOKING_DATA;
  const bookingData: BookingData = {
    ...baseData,
    ...(initialBookingSnapshot ?? {}),
    bookingNo: bookingId,
  };

  const [checkInPax, setCheckInPax] = useState(bookingData.bookingQuantity);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setCheckInPax(bookingData.bookingQuantity);
  }, [bookingData.bookingQuantity]);

  const noShowPax = bookingData.bookingQuantity - checkInPax;

  const handleDecrease = () => {
    if (checkInPax > 0) {
      setCheckInPax(checkInPax - 1);
    }
  };

  const handleIncrease = () => {
    if (checkInPax < bookingData.bookingQuantity) {
      setCheckInPax(checkInPax + 1);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const subtotal = bookingData.units.reduce((sum, unit) => sum + unit.total, 0);
  const discount = 0;
  const totalPrice = subtotal - discount;
  const totalKB = bookingData.units.reduce((sum, unit) => sum + unit.kb, 0);
  const displayTripType = initialTripType ?? bookingData.tripType;
  const hideUnitPriceKbTotal = ["TS0001", "TS0002", "TS0003", "TFTEST-01"].includes(
    bookingId.trim().toUpperCase()
  );
  const tripDetail = getTripDetail(bookingData.tripCode, tripDetailsVariant === "transport");
  const pickUpDetail =
    tripDetailsVariant === "transport"
      ? getTripDetail(bookingData.transportCodePickUp, true)
      : null;
  const dropOffDetail =
    tripDetailsVariant === "transport"
      ? getTripDetail(bookingData.transportCodeDropOff, true)
      : null;

  return (
    <div className="self-stretch p-6 bg-white rounded-2xl border border-[#f8f8f8] flex flex-col justify-start items-start gap-4 overflow-hidden">
      {/* Action bar */}
      {!readonly && (
        <div className="self-stretch flex items-center justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium shadow-sm"
            onClick={() => {
              if (noShowPax > 0) setShowNoShowModal(true);
              else setShowWarningModal(true);
            }}
            startContent={<CheckCircleIcon className="w-5 h-5" />}
          >
            Check In
          </Button>
        </div>
      )}

      {/* Header: รูป + ชื่อโปรแกรม + Trip Type (ตาม reference) */}
      <div className="self-stretch flex justify-start items-center gap-2.5">
        <div className="flex-1 flex justify-start items-center gap-4">
          <img className="w-[52px] h-[52px] rounded-lg object-cover bg-gray-200" src="https://placehold.co/52x52" alt="" />
          <div className="text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 min-w-0 flex-1">
            <CellWithTooltip>{bookingData.title}</CellWithTooltip>
          </div>
        </div>
        <div className="flex justify-start items-center gap-2.5">
          <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Trip Type :</span>
          {/private/i.test(displayTripType) ? (
            <div
              className="w-[88px] px-2 py-1 bg-[#fffbeb] rounded-[30px] outline outline-[0.80px] outline-offset-[-0.80px] outline-[#ffc107] inline-flex flex-col justify-center items-center gap-2"
            >
              <div className="inline-flex justify-center items-center gap-1">
                <UserIcon className="w-5 h-5 text-[#ffc107]" strokeWidth={1.5} />
                <span className="text-center justify-start text-[#ffc107] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
                  Private
                </span>
              </div>
            </div>
          ) : (
            <div
              className="px-2 py-1 bg-[#f8fcff] rounded-[30px] outline outline-[0.80px] outline-offset-[-0.80px] outline-[#265ed6] inline-flex flex-col justify-center items-center gap-1"
            >
              <div className="inline-flex justify-center items-center gap-1">
                <UserGroupIcon className="w-5 h-5 text-[#265ed6]" strokeWidth={1.5} />
                <span className="w-12 text-center justify-start text-[#265ed6] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
                  Join In
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Control — ตาม reference */}
      {!readonly && (
      <div className="w-full max-w-[1568px] p-6 bg-[#f8f8f8] rounded-2xl flex flex-col justify-start items-center gap-4">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center gap-2.5">
            <ClipboardDocumentIcon className="w-4 h-4 text-[#145be1]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 justify-start text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Check-in Control
          </div>
        </div>
        <div className="self-stretch inline-flex justify-center items-start gap-8">
          <div className="w-[147px] inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch text-center justify-start text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
              Booking Quantity
            </div>
            <div className="self-stretch text-center justify-start text-[#265ed6] text-[32px] font-semibold font-['IBM_Plex_Sans_Thai'] leading-[44px]">
              {bookingData.bookingQuantity}
            </div>
            <div className="self-stretch text-center justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Pax
            </div>
          </div>
          <div className="self-stretch inline-flex flex-col justify-center items-center gap-2.5">
            <ArrowRightIcon className="w-6 h-6 text-[#b9b9b9]" strokeWidth={1.5} />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch h-7 flex items-center justify-center">
              <span className="text-center text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                Check in
              </span>
            </div>
            <div className="self-stretch h-11 inline-flex justify-start items-center gap-3">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={checkInPax <= 0}
                className={`p-1 rounded-full flex justify-center items-center gap-2 ${
                  checkInPax <= 0
                    ? "bg-[#f5f5f5] cursor-not-allowed"
                    : "border border-[#265ed6] hover:bg-blue-50/50"
                }`}
              >
                <MinusIcon className="w-6 h-6 text-[#265ed6]" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={checkInPax}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (raw === "") {
                    setCheckInPax(0);
                    return;
                  }
                  const n = parseInt(raw, 10);
                  if (!Number.isNaN(n)) {
                    setCheckInPax(Math.max(0, Math.min(bookingData.bookingQuantity, n)));
                  }
                }}
                className="w-[100px] h-11 px-3 py-1 bg-white rounded-lg border border-[#d9d9d9] text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight text-center outline-none focus:border-[#265ed6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Check-in quantity"
              />
              <button
                type="button"
                onClick={handleIncrease}
                disabled={checkInPax >= bookingData.bookingQuantity}
                className={`p-1 rounded-full flex justify-center items-center gap-2 ${
                  checkInPax >= bookingData.bookingQuantity
                    ? "bg-[#f5f5f5] cursor-not-allowed"
                    : "border border-[#265ed6] hover:bg-blue-50/50"
                }`}
              >
                <PlusIcon
                  className={`w-6 h-6 ${checkInPax >= bookingData.bookingQuantity ? "text-[#b9b9b9]" : "text-[#265ed6]"}`}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
          <div className="w-[14.69px] self-stretch inline-flex flex-col justify-center items-center gap-2.5">
            <span className="self-stretch justify-start text-[#b9b9b9] text-2xl font-normal font-['Inter'] leading-8 tracking-tight">
              =
            </span>
          </div>
          <div className="w-[147px] inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch text-center justify-start text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
              No show
            </div>
            <div className="self-stretch text-center justify-start text-[#d91616] text-[32px] font-semibold font-['IBM_Plex_Sans_Thai'] leading-[44px]">
              {noShowPax}
            </div>
            <div className="self-stretch text-center justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
              Pax
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Booking Details — ตาม reference */}
      <div className="w-full max-w-[1568px] p-6 bg-white rounded-2xl border border-[#d9d9d9] flex flex-col justify-start items-center gap-4">
        <button
          onClick={() => toggleSection("bookingDetails")}
          className="self-stretch inline-flex justify-start items-center gap-2"
        >
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center">
            <DocumentTextIcon className="w-4 h-4 text-[#145be1]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Booking Details
          </div>
          {expandedSections.bookingDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          )}
        </button>
        {expandedSections.bookingDetails && (
          <>
            <div className="self-stretch inline-flex justify-start items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Seller</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.seller}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Booking No.</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingId}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Travel Date</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg inline-flex items-center gap-2 min-w-0 text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                  <CalendarIcon className="w-6 h-6 text-[#292d32] shrink-0" strokeWidth={1.5} />
                  <CellWithTooltip>{bookingData.travelDate}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Payment</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.payment}</CellWithTooltip>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Option</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.option}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Trip round</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg inline-flex items-center gap-2 min-w-0 text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                  <ClockIcon className="w-6 h-6 text-[#292d32] shrink-0" strokeWidth={1.5} />
                  <CellWithTooltip>{bookingData.tripRound}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Trip Type</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.tripType}</CellWithTooltip>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Language</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.language}</CellWithTooltip>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Trip Details — โครงสร้างตาม reference (outline, Trip Details + Chevron, Excursion Details + content card) */}
      <div className="self-stretch p-6 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#d9d9d9] inline-flex flex-col justify-start items-start gap-4">
        <button
          onClick={() => toggleSection("tripDetails")}
          className="self-stretch inline-flex justify-start items-center gap-2"
        >
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center gap-2.5">
            <TruckIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Trip Details
          </div>
          {expandedSections.tripDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} style={{ transform: "rotate(180deg)" }} />
          )}
        </button>
        {expandedSections.tripDetails && tripDetailsVariant === "excursion" && (
          <>
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <div className="w-1 h-6 bg-[#265ed6] rounded-[100px]" />
              <div className="justify-start text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Excursion Details</div>
            </div>
            <div className="self-stretch rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#e5e5e5] flex flex-col justify-center items-start overflow-hidden">
              <div className="self-stretch p-6 bg-[#f8f8f8] rounded-tl-2xl rounded-tr-2xl inline-flex justify-start items-start gap-6">
                <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#265ed6] inline-flex flex-col justify-start items-start">
                  <div className="px-4 py-2 flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-center items-center gap-2">
                      <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">Trip Code :</div>
                      <div className="flex justify-start items-start gap-1">
                        <div className="justify-start text-[#265ed6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6 tracking-tight line-clamp-1">{bookingData.tripCode}</div>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(bookingData.tripCode)} className="p-0.5" aria-label="คัดลอก">
                        <ClipboardDocumentIcon className="w-6 h-6 text-[#265ed6]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-6 flex flex-col justify-center items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-2">
                  <TruckIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 shrink-0">Vehicle Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2 min-w-0">
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                        {tripDetail.vehicleName}
                      </div>
                    </div>
                    <div className="self-stretch justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      {tripDetail.registration}
                    </div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2">
                  <UserIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 shrink-0">Personnel Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2 flex-1 min-w-0">
                    {tripDetail.personnel.length > 0 ? (
                      tripDetail.personnel.map((p: TripPerson, index: number) => (
                        <div key={`person-${index}`} className="inline-flex justify-end items-center gap-2 flex-wrap">
                          <div className="flex justify-start items-center gap-2">
                            <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                              {p.position} :
                            </div>
                          </div>
                          <div className="text-right justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.name}</div>
                          <a
                            href={`tel:${p.phone}`}
                            className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                          >
                            {p.phone}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">-</div>
                    )}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2">
                  <UserGroupIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 shrink-0">Guide Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2 flex-1 min-w-0">
                    {tripDetail.guides.length > 0 ? (
                      tripDetail.guides.map((g: TripPerson, index: number) => (
                        <div key={`guide-${index}`} className="inline-flex justify-end items-center gap-2 flex-wrap">
                          <div className="flex justify-start items-center gap-2">
                            <div className="justify-start text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                              {g.position} :
                            </div>
                          </div>
                          <div className="text-right justify-start text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{g.name}</div>
                          <a
                            href={`tel:${g.phone}`}
                            className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"
                          >
                            {g.phone}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">-</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {expandedSections.tripDetails && tripDetailsVariant === "transport" && (
          <>
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <div className="w-1 h-6 bg-[#265ed6] rounded-[100px]" />
              <div className="justify-start text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Transport details</div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-6 flex-wrap">
              {/* Pick - Up */}
            <div className="flex-1 min-w-[280px] rounded-2xl border border-[#d9d9d9] inline-flex flex-col justify-center items-start overflow-hidden">
              <div className="self-stretch p-6 bg-[#f8f8f8] rounded-tl-2xl rounded-tr-2xl inline-flex justify-start items-start gap-6 flex-wrap">
                <div className="flex-1 flex justify-start items-center gap-2 min-w-0">
                  <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center shrink-0">
                    <MapPinIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
                  </div>
                  <div className="text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Pick - Up</div>
                </div>
                <div className="bg-white rounded-lg border border-[#265ed6] inline-flex flex-col justify-start items-start shrink-0">
                  <div className="px-4 py-2 flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-center items-center gap-2 flex-wrap">
                      <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Transport Code :</span>
                      <span className="text-[#265ed6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6">{bookingData.transportCodePickUp}</span>
                      <button type="button" onClick={() => copyToClipboard(bookingData.transportCodePickUp)} className="p-0.5" aria-label="คัดลอก">
                        <ClipboardDocumentIcon className="w-5 h-5 text-[#265ed6]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-6 flex flex-col justify-center items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <TruckIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Vehicle Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    <div className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{pickUpDetail?.vehicleName ?? bookingData.pickUpVehicle}</div>
                    <div className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{pickUpDetail?.registration ?? bookingData.vehiclePlate}</div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <UserGroupIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Personnel Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    {pickUpDetail?.personnel.length ? (
                      pickUpDetail.personnel.map((p, i) => (
                        <div key={i} className="inline-flex justify-start items-center gap-2 flex-wrap">
                          <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.position} :</span>
                          <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.name}</span>
                          <a href={`tel:${p.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.phone}</a>
                        </div>
                      ))
                    ) : (
                      <div className="inline-flex justify-start items-center gap-2 flex-wrap">
                        <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Driver :</span>
                        <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingData.pickUpDriver.name}</span>
                        <a href={`tel:${bookingData.pickUpDriver.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingData.pickUpDriver.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <UserIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Guide Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    {pickUpDetail?.guides.length ? (
                      pickUpDetail.guides.map((g, i) => (
                        <div key={i} className="inline-flex justify-start items-center gap-2 flex-wrap">
                          <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Guide {i + 1} :</span>
                          <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{g.name}</span>
                          <a href={`tel:${g.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{g.phone}</a>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Drop - off */}
            <div className="flex-1 min-w-[280px] rounded-2xl border border-[#d9d9d9] inline-flex flex-col justify-center items-start overflow-hidden">
              <div className="self-stretch p-6 bg-[#f8f8f8] rounded-tl-2xl rounded-tr-2xl inline-flex justify-start items-start gap-6 flex-wrap">
                <div className="flex-1 flex justify-start items-center gap-2 min-w-0">
                  <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center shrink-0">
                    <MapPinIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
                  </div>
                  <div className="text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">Drop - off</div>
                </div>
                <div className="bg-white rounded-lg border border-[#265ed6] inline-flex flex-col justify-start items-start shrink-0">
                  <div className="px-4 py-2 flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-center items-center gap-2 flex-wrap">
                      <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Transport Code :</span>
                      <span className="text-[#265ed6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6">{bookingData.transportCodeDropOff}</span>
                      <button type="button" onClick={() => copyToClipboard(bookingData.transportCodeDropOff)} className="p-0.5" aria-label="คัดลอก">
                        <ClipboardDocumentIcon className="w-5 h-5 text-[#265ed6]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-6 flex flex-col justify-center items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <TruckIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Vehicle Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    <div className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{dropOffDetail?.vehicleName ?? bookingData.dropOffVehicle}</div>
                    <div className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{dropOffDetail?.registration ?? bookingData.vehiclePlate}</div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <UserGroupIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Personnel Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    {dropOffDetail?.personnel.length ? (
                      dropOffDetail.personnel.map((p, i) => (
                        <div key={i} className="inline-flex justify-start items-center gap-2 flex-wrap">
                          <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.position} :</span>
                          <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.name}</span>
                          <a href={`tel:${p.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{p.phone}</a>
                        </div>
                      ))
                    ) : (
                      <div className="inline-flex justify-start items-center gap-2 flex-wrap">
                        <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Driver :</span>
                        <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingData.dropOffDriver.name}</span>
                        <a href={`tel:${bookingData.dropOffDriver.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{bookingData.dropOffDriver.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                  <UserIcon className="w-6 h-6 text-[#265ed6] shrink-0" strokeWidth={1.5} />
                  <div className="w-40 shrink-0 text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Guide Detail</div>
                  <div className="inline-flex flex-col justify-center items-start gap-2">
                    {dropOffDetail?.guides.length ? (
                      dropOffDetail.guides.map((g, i) => (
                        <div key={i} className="inline-flex justify-start items-center gap-2 flex-wrap">
                          <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">Guide {i + 1} :</span>
                          <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{g.name}</span>
                          <a href={`tel:${g.phone}`} className="text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{g.phone}</a>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Details — ตาม reference */}
      <div className="w-full max-w-[1568px] p-6 bg-white rounded-2xl border border-[#d9d9d9] inline-flex flex-col justify-start items-center gap-4">
        <button
          onClick={() => toggleSection("customerDetails")}
          className="self-stretch inline-flex justify-start items-center gap-2"
        >
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center">
            <UserIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Customer Details
          </div>
          {expandedSections.customerDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          )}
        </button>
        {expandedSections.customerDetails && (
          <>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Customer name</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.customerName}</CellWithTooltip></div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Nationality</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.nationality || "-"}</CellWithTooltip></div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Email</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.email}</CellWithTooltip></div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Phone number</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.phone}</CellWithTooltip></div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-end gap-4 flex-wrap">
              <div className="w-[343px] max-w-full flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Contact method</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.contactMethod}</CellWithTooltip></div>
              </div>
              <div className="w-[343px] max-w-full flex flex-col gap-1">
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>ABCD</CellWithTooltip></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Unit Details — ตาม reference/รูป */}
      <div className="self-stretch p-6 bg-white rounded-2xl border border-[#d9d9d9] inline-flex flex-col justify-start items-center gap-4">
        <button
          onClick={() => toggleSection("unitDetails")}
          className="self-stretch inline-flex justify-start items-center gap-2"
        >
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center gap-2.5">
            <UserGroupIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Unit Details
          </div>
          {expandedSections.unitDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          )}
        </button>
        {expandedSections.unitDetails && (
          <div className="flex flex-col justify-center items-end gap-2 w-full min-w-0">
            {/* Header row */}
            <div className="self-stretch px-6 inline-flex justify-center items-center gap-6">
              <div className="flex-1 flex justify-center items-center gap-2.5 min-w-0">
                <div className="flex-1 justify-center text-[#676363] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight line-clamp-1 text-left">Unit</div>
              </div>
              <div className="flex justify-start items-center gap-20 shrink-0">
                <div className="w-20 justify-center text-[#676363] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight line-clamp-1">Quantity</div>
                {!hideUnitPriceKbTotal && (
                  <>
                    <div className="w-40 flex justify-center items-center gap-2.5">
                      <div className="flex-1 text-right justify-center text-[#676363] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight line-clamp-1">Price</div>
                    </div>
                    <div className="w-[158px] justify-center text-[#676363] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight line-clamp-1">KB</div>
                    <div className="w-[158px] justify-center text-[#676363] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight line-clamp-1">Total</div>
                  </>
                )}
              </div>
            </div>
            {/* Unit rows */}
            {bookingData.units.map((unit, index) => (
              <div key={index} className="self-stretch px-6 py-2 bg-[#f8f8f8] rounded-lg inline-flex justify-start items-center gap-2.5 min-w-0">
                <div className="flex-1 flex justify-center items-center gap-2.5 min-w-0">
                  <div className="flex-1 justify-center text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1 text-left">{unit.type}</div>
                </div>
                <div className="flex justify-end items-center gap-20 shrink-0">
                  <div className="w-20 flex justify-start items-center gap-2.5">
                    <div className="w-[100px] flex justify-center items-center gap-2.5">
                      <div className="flex-1 justify-center text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">{unit.quantity}</div>
                    </div>
                  </div>
                  {!hideUnitPriceKbTotal && (
                    <>
                      <div className="flex justify-start items-center gap-2.5">
                        <div className="justify-center text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">{unit.price.toLocaleString()}</div>
                      </div>
                      <div className="w-[158px] flex justify-start items-center gap-2.5">
                        <div className="w-[100px] flex justify-center items-center gap-2.5">
                          <div className="flex-1 justify-center text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">฿ {unit.kb.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="w-[158px] flex justify-start items-center gap-2.5">
                        <div className="w-[100px] flex justify-center items-center gap-2.5">
                          <div className="flex-1 justify-center text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">฿ {unit.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {/* Separator */}
            <div className="self-stretch h-0 border-t border-[#d0d4d9]" />
            {!hideUnitPriceKbTotal && (
              <>
                {/* Sub total */}
                <div className="self-stretch rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch px-4 py-2 flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="flex-1 inline-flex flex-col justify-center items-start gap-0.5">
                        <div className="self-stretch justify-start text-[#265ed6] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Sub total</div>
                      </div>
                      <div className="w-[166px] flex justify-start items-center gap-2.5">
                        <div className="w-[100px] flex justify-center items-center gap-2.5">
                          <div className="flex-1 justify-center text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">฿ {subtotal.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Discount */}
                <div className="self-stretch bg-[#f8fcff] rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch px-4 py-2 flex flex-col justify-center items-center gap-4">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="w-8 h-8 p-1 bg-[#dceeff] rounded-full flex justify-center items-center gap-2.5 shrink-0">
                        <Cog6ToothIcon className="w-5 h-5 text-[#265ed6]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 inline-flex flex-col justify-center items-start gap-0.5 min-w-0">
                        <div className="self-stretch justify-start text-[#265ed6] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Discount</div>
                      </div>
                      <div className="w-[166px] flex justify-start items-center gap-2.5 shrink-0">
                        <div className="w-[166px] py-2 bg-[#f8f8f8] rounded-lg flex justify-center items-center gap-2">
                          <div className="flex-1 justify-center text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">฿ {discount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Summary boxes */}
            <div className="self-stretch inline-flex justify-end items-center gap-4 flex-wrap">
              <div className="w-40 bg-[#f5fff5] rounded-2xl border border-[#1cb579] inline-flex flex-col justify-start items-start">
                <div className="self-stretch py-[11px] flex flex-col justify-center items-center gap-4">
                  <div className="self-stretch flex flex-col justify-center items-center">
                    <div className="justify-start text-[#2a2a2a] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight line-clamp-1">Total Pax</div>
                    <div className="justify-start text-[#1cb579] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">{bookingData.bookingQuantity}</div>
                  </div>
                </div>
              </div>
              {!hideUnitPriceKbTotal && (
                <>
                  <div className="w-40 bg-[#fffbf4] rounded-2xl border border-[#fe7931] inline-flex flex-col justify-start items-start">
                    <div className="self-stretch py-[11px] flex flex-col justify-center items-center gap-4">
                      <div className="self-stretch flex flex-col justify-center items-center">
                        <div className="justify-start text-[#2a2a2a] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight line-clamp-1">Total KB</div>
                        <div className="justify-start text-[#fd5c04] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">฿ {totalKB.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[182px] bg-[#f8fcff] rounded-2xl border border-[#265ed6] inline-flex flex-col justify-start items-start">
                    <div className="px-14 py-[11px] flex flex-col justify-center items-center gap-4">
                      <div className="self-stretch flex flex-col justify-center items-center">
                        <div className="justify-start text-[#2a2a2a] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight line-clamp-1">Total Price</div>
                        <div className="justify-start text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight line-clamp-1">฿ {totalPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Details — ตาม reference */}
      <div className="w-full max-w-[1568px] p-6 bg-white rounded-2xl border border-[#d9d9d9] flex flex-col justify-start items-center gap-4">
        <button
          onClick={() => toggleSection("locationDetails")}
          className="self-stretch inline-flex justify-start items-center gap-2"
        >
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center">
            <MapPinIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Location Details
          </div>
          {expandedSections.locationDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
          )}
        </button>
        {expandedSections.locationDetails && (
          <>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Meeting point location</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.meetingPoint || "-"}</CellWithTooltip></div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Pick up location</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
                  <CellWithTooltip>{bookingData.pickUpLocation || "-"}</CellWithTooltip>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Pick-up Address</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.pickUpAddress || "-"}</CellWithTooltip></div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Drop - off point</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.dropOffPoint || "-"}</CellWithTooltip></div>
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-1">
                <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Drop - off remark</div>
                <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0"><CellWithTooltip>{bookingData.dropOffRemark || "-"}</CellWithTooltip></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Remark — ตาม reference */}
      <div className="w-full max-w-[1568px] p-6 bg-white rounded-2xl border border-[#d9d9d9] flex flex-col justify-start items-center gap-4">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          <div className="p-2 bg-[#dceeff] rounded-2xl flex justify-center items-center">
            <ClipboardDocumentIcon className="w-4 h-4 text-[#265ed6]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[#2a2a2a] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
            Remark
          </div>
          <ChevronDownIcon className="w-6 h-6 text-[#2a2a2a]" strokeWidth={1.5} />
        </div>
        <div className="self-stretch flex flex-col gap-1">
          <div className="text-[#2a2a2a] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight">Remark</div>
          <div className="px-3 py-2 bg-[#f8f8f8] rounded-lg text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">
            <CellWithTooltip>-</CellWithTooltip>
          </div>
        </div>
      </div>

      {/* No Show Modal */}
      <NoShowModal
        isOpen={showNoShowModal}
        onClose={() => setShowNoShowModal(false)}
        checkInPax={checkInPax}
        bookingQuantity={bookingData.bookingQuantity}
        noShowPax={noShowPax}
        bookingNo={bookingId}
        travelDate={bookingData.travelDate}
        tripRound={bookingData.tripRound}
        tripType={bookingData.tripType}
        pricePerPax={bookingData.units.find((u) => u.quantity > 0)?.price || 1500}
        units={bookingData.units}
        onConfirm={(condition, data) => {
          console.log("No-show condition:", condition, data);
          setShowNoShowModal(false);
          // แสดง Warning Modal ก่อน
          setShowWarningModal(true);
        }}
        onLater={() => {
          // เมื่อกด Later ให้ไปจบ process เลย
          setShowNoShowModal(false);
          setShowWarningModal(true);
        }}
      />

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        onConfirm={() => {
          setShowWarningModal(false);
          // แสดง Loading
          setShowLoading(true);
          // Simulate API call
          setTimeout(() => {
            setShowLoading(false);
            setShowSuccess(true);
          }, 1500);
        }}
        onCancel={() => setShowWarningModal(false)}
      />

      {/* Loading Modal */}
      <LoadingModal isOpen={showLoading} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          // Call onCheckIn to navigate back to initial check in page
          onCheckIn(checkInPax);
        }}
      />
    </div>
  );
}
