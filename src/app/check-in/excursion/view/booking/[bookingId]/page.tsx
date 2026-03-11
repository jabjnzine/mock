"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  DocumentTextIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";
import Footer from "../../../../../components/Footer";
import NoShowModal from "../../../../../components/NoShowModal";
import WarningModal from "../../../../../components/WarningModal";

// Mock data for single booking view (จาก UI ที่ส่งมา)
const mockBooking = {
  bookingNo: "TQC417792",
  program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
  tripType: "Join In",
  seller: "Klook",
  travelDate: "17/12/2025",
  payment: "Pending",
  option: "Day Trip with Shared Transfer excluding National Park Fee",
  tripRound: "07:30",
  language: "EN",
  customerName: "Zakenya Crawford",
  nationality: "-",
  email: "jmmlbc64j3cvnh@reply.getyourguide.com",
  phone: "+14042349390",
  contactMethod: "We Chat",
  contactRemark: "ABCD",
  tripCode: "EC25Z1PW",
  vehicle: "Speed Catamaran 2 engines (30)",
  vehicleRemark: "โลมาใจดี NO1",
  captain: "Capt. Trunk",
  captainPhone: "096-6502747",
  captainAssist1: "Jane Cooper",
  captainAssist1Phone: "0684 555-0102",
  captainAssist2: "Savannah Nguyen",
  captainAssist2Phone: "(629) 555-0129",
  guide1: "G. Peter",
  guide1Phone: "094-4313995",
  guide2: "G. ter",
  guide2Phone: "095-4313995",
  meetingPoint: "-",
  pickUpLocation:
    "Hilltop Wellness Resort Phuket, 138 Soi Si Suchat View, Ratsada, Mueang Phuket District, Phuket 83000, Thailand",
  pickUpAddress: "-",
  dropOffPoint: "-",
  dropOffRemark: "-",
  remark: "-",
  bookingQty: 5,
  checkInQty: 5,
  noShowQty: 0,
  units: [
    { name: "Infant (Default)", price: 0, qty: 0, kb: 0, total: 0 },
    { name: "Adult", price: 1500, qty: 5, kb: 0, total: 7500 },
  ],
  subTotal: 7500,
  discount: 0,
  totalPax: 5,
  totalKb: 0,
  totalPrice: 7500,
};

export default function ViewBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params.bookingId as string) || "";
  // เลข Booking ที่แสดง = ตามที่เลือกจากหน้า Check In (จาก URL)
  const displayBookingNo = bookingId || mockBooking.bookingNo;

  const [checkInQty, setCheckInQty] = useState(mockBooking.checkInQty);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const bookingQty = mockBooking.bookingQty;
  const noShowQty = bookingQty - checkInQty;

  const goToCheckInPage = (completedBookingCode?: string) => {
    if (typeof window !== "undefined" && completedBookingCode) {
      try {
        const key = "excursionCheckedInBookingCodes";
        const raw = sessionStorage.getItem(key);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(completedBookingCode)) list.push(completedBookingCode);
        sessionStorage.setItem(key, JSON.stringify(list));
      } catch (_) {}
    }
    router.push("/check-in/excursion");
  };

  const handleCancel = () => {
    goToCheckInPage();
  };

  const handleCheckIn = () => {
    // ถ้าลดจำนวน Pax จากเดิม → เปิดโฟลว Select No-show Condition
    if (noShowQty > 0) {
      setShowNoShowModal(true);
      return;
    }
    // ถ้าจำนวนคนครบ → เข้าหน้า Warning โฟลวปกติ (Do you want to Check In ?)
    setShowWarningModal(true);
  };

  const decrement = () => setCheckInQty((n) => Math.max(0, n - 1));
  const increment = () => setCheckInQty((n) => Math.min(bookingQty, n + 1));

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1616px] mx-auto px-6 py-6 flex flex-col gap-6">
            {/* Breadcrumb + Actions */}
            <div className="w-full inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-2">
                <span className="text-zinc-400 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                  Check in
                </span>
                <ChevronRightIcon className="size-6 text-zinc-800" />
                <span className="text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                  View Booking
                </span>
              </div>
              <div className="flex justify-start items-start gap-6">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="px-5 py-2 bg-blue-700 rounded-full flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    Check In
                  </span>
                </button>
              </div>
            </div>

            {/* White card: Program + Check-in Control + Booking Details + ... */}
            <div className="w-full p-6 bg-white rounded-2xl border border-stone-50 flex flex-col gap-4">
              {/* Program row */}
              <div className="w-full flex justify-start items-center gap-2.5">
                <img
                  className="size-12 rounded-lg object-cover bg-stone-100"
                  src="https://placehold.co/52x52"
                  alt=""
                />
                <div className="flex-1 flex justify-start items-center gap-4">
                  <span className="text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">
                    {mockBooking.program}
                  </span>
                </div>
                <div className="flex justify-start items-center gap-3">
                  <span className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                    Trip Type :
                  </span>
                  <span className="px-2 py-1 bg-slate-50 rounded-[30px] border border-blue-700 text-blue-700 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4">
                    {mockBooking.tripType}
                  </span>
                </div>
              </div>

              {/* Check-in Control */}
              <div className="w-full p-6 bg-stone-50 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <DocumentTextIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Check-in Control
                  </span>
                </div>
                <div className="flex justify-center items-start gap-8">
                  <div className="w-36 flex flex-col justify-start items-start gap-2">
                    <span className="w-full text-center text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                      Booking Quantity
                    </span>
                    <span className="w-full text-center text-blue-700 text-3xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-10">
                      {bookingQty}
                    </span>
                    <span className="w-full text-center text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      Pax
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-2.5">
                    <ChevronRightIcon className="size-6 text-zinc-400 rotate-[-90deg]" />
                  </div>
                  <div className="flex flex-col justify-start items-start gap-2">
                    <span className="w-full text-center text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                      Check in
                    </span>
                    <div className="flex justify-start items-center gap-3">
                      <button
                        type="button"
                        onClick={decrement}
                        disabled={checkInQty <= 0}
                        className="size-8 p-1 rounded-full border border-blue-700 flex justify-center items-center text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon className="size-5" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={checkInQty}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          if (raw === "") {
                            setCheckInQty(0);
                            return;
                          }
                          const n = parseInt(raw, 10);
                          if (!Number.isNaN(n)) {
                            setCheckInQty(Math.max(0, Math.min(bookingQty, n)));
                          }
                        }}
                        className="w-24 h-11 px-3 py-1 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Check-in quantity"
                      />
                      <button
                        type="button"
                        onClick={increment}
                        disabled={checkInQty >= bookingQty}
                        className="size-8 p-1 rounded-full border border-blue-700 flex justify-center items-center text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-stone-50 disabled:text-zinc-400"
                      >
                        <PlusIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-3.5 self-stretch flex flex-col justify-center items-center">
                    <span className="text-zinc-400 text-2xl font-normal font-['Inter'] leading-8">
                      =
                    </span>
                  </div>
                  <div className="w-36 flex flex-col justify-start items-start gap-2">
                    <span className="w-full text-center text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                      No show
                    </span>
                    <span className="w-full text-center text-red-600 text-3xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-10">
                      {noShowQty}
                    </span>
                    <span className="w-full text-center text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                      Pax
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <DocumentTextIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Booking Details
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LabelValue label="Seller" value={mockBooking.seller} />
                  <LabelValue label="Booking No." value={displayBookingNo} />
                  <LabelValue label="Travel Date" value={mockBooking.travelDate} />
                  <LabelValue label="Payment" value={mockBooking.payment} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LabelValue label="Option" value={mockBooking.option} className="col-span-2" />
                  <LabelValue label="Trip round" value={mockBooking.tripRound} />
                  <LabelValue label="Trip Type" value={mockBooking.tripType} />
                  <LabelValue label="Language" value={mockBooking.language} />
                </div>
              </div>

              {/* Trip Details - Excursion Details */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <DocumentTextIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Trip Details
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-blue-700 rounded-full" />
                  <span className="text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">
                    Excursion Details
                  </span>
                </div>
                <div className="rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="p-6 bg-stone-50 flex flex-wrap gap-6">
                    <div className="px-4 py-2 bg-white rounded-lg border border-blue-700 flex items-center gap-1">
                      <span className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                        Trip Code :
                      </span>
                      <span className="text-blue-700 text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6">
                        {mockBooking.tripCode}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    <DetailBlock
                      icon={<TruckIcon className="size-6 text-blue-700" />}
                      title="Vehicle Detail"
                      lines={[
                        mockBooking.vehicle,
                        mockBooking.vehicleRemark,
                      ]}
                    />
                    <DetailBlock
                      icon={<UserGroupIcon className="size-6 text-blue-700" />}
                      title="Personnel Detail"
                      lines={[
                        { label: "Captain :", value: mockBooking.captain, sub: mockBooking.captainPhone },
                        { label: "Captain Assistance 1 :", value: mockBooking.captainAssist1, sub: mockBooking.captainAssist1Phone },
                        { label: "Captain Assistance 2 :", value: mockBooking.captainAssist2, sub: mockBooking.captainAssist2Phone },
                      ]}
                    />
                    <DetailBlock
                      icon={<UserGroupIcon className="size-6 text-blue-700" />}
                      title="Guide Detail"
                      lines={[
                        { label: "Guide 1 :", value: mockBooking.guide1, sub: mockBooking.guide1Phone },
                        { label: "Guide 2 :", value: mockBooking.guide2, sub: mockBooking.guide2Phone },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <UserGroupIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Customer Details
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LabelValue label="Customer name" value={mockBooking.customerName} />
                  <LabelValue label="Nationality" value={mockBooking.nationality} />
                  <LabelValue label="Email" value={mockBooking.email} />
                  <LabelValue label="Phone number" value={mockBooking.phone} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <LabelValue label="Contact method" value={mockBooking.contactMethod} />
                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-2 bg-stone-50 rounded-lg">
                      <span className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                        {mockBooking.contactRemark}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Details */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <ClipboardDocumentListIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Unit Details
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="px-6 py-2 flex justify-center items-center gap-6">
                    <div className="flex-1 text-center text-stone-500 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Unit
                    </div>
                    <div className="w-40 text-right text-stone-500 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Price
                    </div>
                    <div className="w-20 text-center text-stone-500 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Quantity
                    </div>
                    <div className="w-40 text-center text-stone-500 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      KB
                    </div>
                    <div className="w-40 text-center text-stone-500 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Total
                    </div>
                  </div>
                  {mockBooking.units.map((row, i) => (
                    <div
                      key={i}
                      className="w-full px-6 py-2 bg-stone-50 rounded-lg flex justify-start items-center gap-20"
                    >
                      <div className="flex-1 text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                        {row.name}
                      </div>
                      <div className="w-40 text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                        {row.price.toLocaleString()}
                      </div>
                      <div className="w-20 text-center text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                        {row.qty}
                      </div>
                      <div className="w-40 text-center text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                        ฿ {row.kb.toLocaleString()}
                      </div>
                      <div className="w-40 text-center text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                        ฿ {row.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-300" />
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-blue-700 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Sub total
                    </span>
                    <span className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                      ฿ {mockBooking.subTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-lg flex justify-between items-center">
                    <span className="text-blue-700 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                      Discount
                    </span>
                    <div className="px-3 py-2 bg-stone-50 rounded-lg">
                      <span className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                        ฿ {mockBooking.discount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <div className="w-40 bg-green-50 rounded-2xl border border-emerald-500 px-14 py-2.5 flex flex-col items-center">
                    <span className="text-zinc-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4">
                      Total Pax
                    </span>
                    <span className="text-emerald-500 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                      {mockBooking.totalPax}
                    </span>
                  </div>
                  <div className="w-40 bg-stone-50 rounded-2xl border border-orange-400 px-14 py-2.5 flex flex-col items-center">
                    <span className="text-zinc-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4">
                      Total KB
                    </span>
                    <span className="text-orange-600 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                      ฿ {mockBooking.totalKb.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-44 bg-slate-50 rounded-2xl border border-blue-700 px-14 py-2.5 flex flex-col items-center">
                    <span className="text-zinc-800 text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-4">
                      Total Price
                    </span>
                    <span className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                      ฿ {mockBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <MapPinIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Location Details
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label="Meeting point location" value={mockBooking.meetingPoint} />
                  <LabelValue label="Pick up location" value={mockBooking.pickUpLocation} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label="Pick-up Address" value={mockBooking.pickUpAddress} />
                  <LabelValue label="Drop - off point" value={mockBooking.dropOffPoint} />
                  <LabelValue label="Drop - off remark" value={mockBooking.dropOffRemark} />
                </div>
              </div>

              {/* Remark */}
              <div className="w-full p-6 bg-white rounded-2xl border border-zinc-300 flex flex-col gap-4">
                <div className="flex justify-start items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-2xl flex justify-center items-center">
                    <ClipboardDocumentListIcon className="size-4 text-blue-700" />
                  </div>
                  <span className="flex-1 text-zinc-800 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-tight">
                    Remark
                  </span>
                  <ChevronRightIcon className="size-6 text-zinc-800" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
                    Remark
                  </span>
                  <div className="px-3 py-2 bg-stone-50 rounded-lg">
                    <span className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">
                      {mockBooking.remark}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* โฟลวจำนวนคนครบ: กด Check In → Warning (Do you want to Check In ?) → Ok แล้วกลับไปหน้า Check In / Check In */}
      <WarningModal
        isOpen={showWarningModal}
        onConfirm={() => {
          setShowWarningModal(false);
          goToCheckInPage(displayBookingNo);
        }}
        onCancel={() => setShowWarningModal(false)}
      />

      {/* โฟลว No-show: เมื่อลดจำนวน Pax แล้วกด Check In → Select No-show Condition → เสร็จแล้วกลับไปหน้า Check In / Check In เท่านั้น */}
      <NoShowModal
        isOpen={showNoShowModal}
        onClose={() => {
          setShowNoShowModal(false);
          goToCheckInPage();
        }}
        checkInPax={checkInQty}
        bookingQuantity={bookingQty}
        noShowPax={noShowQty}
        bookingNo={displayBookingNo}
        travelDate={mockBooking.travelDate}
        tripRound={mockBooking.tripRound}
        tripType={mockBooking.tripType}
        customerName={mockBooking.customerName}
        pricePerPax={mockBooking.units.find((u) => u.total > 0)?.price ?? 1500}
        onConfirm={() => {
          setShowNoShowModal(false);
          goToCheckInPage(displayBookingNo);
        }}
      />
    </div>
  );
}

function LabelValue({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-zinc-800 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5">
        {label}
      </span>
      <div className="px-3 py-2 bg-stone-50 rounded-lg">
        <span className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 line-clamp-2">
          {value}
        </span>
      </div>
    </div>
  );
}

function DetailBlock({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines:
    | string[]
    | { label: string; value: string; sub?: string }[];
}) {
  const isSimple = lines.length > 0 && typeof lines[0] === "string";
  return (
    <div className="flex justify-start items-start gap-2">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 flex flex-col gap-2">
        <span className="text-blue-700 text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 w-40">
          {title}
        </span>
        {isSimple
          ? (lines as string[]).map((line, i) => (
              <span
                key={i}
                className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6"
              >
                {line}
              </span>
            ))
          : (lines as { label: string; value: string; sub?: string }[]).map((line, i) => (
              <div key={i} className="flex justify-start items-center gap-2 flex-wrap">
                <span className="text-zinc-800 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 shrink-0">
                  {line.label}
                </span>
                <span className="text-zinc-800 text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 text-right">
                  {line.value}
                </span>
                {line.sub && (
                  <span className="text-blue-700 text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6">
                    {line.sub}
                  </span>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
