"use client";

import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import NoShowModal from "./NoShowModal";
import WarningModal from "./WarningModal";
import LoadingModal from "./LoadingModal";
import SuccessModal from "./SuccessModal";

interface BookingDetailsProps {
  bookingId: string;
  onCancel: () => void;
  onCheckIn: (checkInPax: number) => void;
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
  vehicleDetail: string;
  vehiclePlate: string;
  captain: { name: string; phone: string };
  assistant: { name: string; phone: string };
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

export default function BookingDetails({
  bookingId,
  onCancel,
  onCheckIn,
}: BookingDetailsProps) {
  const [expandedSections, setExpandedSections] = useState({
    bookingDetails: true,
    tripDetails: true,
    transportDetails: true,
    customerDetails: true,
    unitDetails: true,
    locationDetails: true,
  });

  const bookingData: BookingData = {
    bookingNo: "TQC417792",
    title: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    seller: "Klook",
    travelDate: "27/01/2026",
    payment: "Pending",
    option: "Day Trip with Shared Transfer excluding Natio...",
    tripRound: "07:30",
    tripType: "Join In",
    language: "EN",
    tripCode: "EC25A956",
    vehicleDetail: "Speed Catamaran 2 engines: 30",
    vehiclePlate: "โลมาใจดี กข1234",
    captain: { name: "Capt. Trunk", phone: "096-6502747" },
    assistant: { name: "Jane Cooper", phone: "0684 555-0102" },
    guide1: { name: "G. Peter", phone: "094-4313995" },
    guide2: { name: "G. ter", phone: "095-4313995" },
    pickUpVehicle: "Dash MV - BUS: 30",
    pickUpDriver: { name: "Rick Wright", phone: "096-6502747" },
    pickUpGuide1: { name: "G. Peter", phone: "094-4313995" },
    pickUpGuide2: { name: "G. ter", phone: "095-4313995" },
    dropOffVehicle: "Dash MV - BUS: 30",
    dropOffDriver: { name: "Rick Wright", phone: "096-6502747" },
    dropOffGuide1: { name: "G. Peter", phone: "094-4313995" },
    dropOffGuide2: { name: "G. ter", phone: "095-4313995" },
    customerName: "Zakenya Crawford",
    nationality: "-",
    email: "jmmlbc64j3cvnh@reply.getyourguide.com",
    phone: "+14042349390",
    contactMethod: "We Chat",
    units: [
      { type: "Infant (Default)", price: 0, quantity: 0, kb: 0, total: 0 },
      { type: "Adult", price: 1500, quantity: 5, kb: 0, total: 7500 },
    ],
    meetingPoint: "-",
    pickUpLocation:
      "Hilltop Wellness Resort Phuket, 138 Soi Si Suchat View, Ratsada, Mueang Phuket District, Phuket 8...",
    pickUpAddress: "-",
    dropOffPoint: "-",
    dropOffRemark: "-",
    bookingQuantity: 5,
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
    if (checkInPax > 1) {
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

  return (
    <div className="space-y-5 bg-white">
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            onClick={onCancel}
            className="text-gray-700 hover:text-gray-900"
            startContent={<XMarkIcon className="w-5 h-5" />}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trip Type:</span>
            <select className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Join In</option>
            </select>
            <Button
              size="sm"
              variant="light"
              className="text-gray-700 hover:text-gray-900"
            >
              Switch
            </Button>
          </div>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium shadow-sm"
          onClick={() => {
            if (noShowPax > 0) {
              setShowNoShowModal(true);
            } else {
              // จำนวนคนครบ - แสดง Warning Modal
              setShowWarningModal(true);
            }
          }}
          startContent={<CheckCircleIcon className="w-5 h-5" />}
        >
          Check In
        </Button>
      </div>

      {/* Booking Title */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">
          {bookingData.title}
        </h2>
      </div>

      {/* Check-in Control */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Check-in Control
          </h3>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-900 mb-2 font-medium">
              Booking Quantity
            </div>
            <div className="text-5xl font-bold text-blue-600">
              {bookingData.bookingQuantity}
            </div>
            <div className="text-sm text-gray-500 mt-1">Pax</div>
          </div>

          <ArrowRightIcon className="w-6 h-6 text-gray-400 mt-8" />

          <div className="text-center">
            <div className="text-sm text-gray-900 mb-2 font-medium">
              Check in
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleDecrease}
                disabled={checkInPax <= 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  checkInPax <= 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                <MinusIcon className="w-5 h-5" />
              </button>
              <div className="bg-white border border-gray-300 rounded-md px-4 py-2 min-w-[60px] text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {checkInPax}
                </div>
              </div>
              <button
                onClick={handleIncrease}
                disabled={checkInPax >= bookingData.bookingQuantity}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  checkInPax >= bookingData.bookingQuantity
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-1">Pax</div>
          </div>

          <div className="text-3xl text-gray-400 mt-8">=</div>

          <div className="text-center">
            <div className="text-sm text-gray-900 mb-2 font-medium">
              No show
            </div>
            <div className="text-5xl font-bold text-red-600">
              {noShowPax}
            </div>
            <div className="text-sm text-gray-500 mt-1">Pax</div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection("bookingDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Booking Details
            </h3>
          </div>
          {expandedSections.bookingDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.bookingDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Seller</label>
                <input
                  type="text"
                  value={bookingData.seller}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Booking No.
                </label>
                <input
                  type="text"
                  value={bookingData.bookingNo}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Travel Date
                </label>
                <input
                  type="text"
                  value={bookingData.travelDate}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Payment</label>
                <input
                  type="text"
                  value={bookingData.payment}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Option</label>
              <input
                type="text"
                value={bookingData.option}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Trip round:</span>
                <span className="text-sm text-gray-900">{bookingData.tripRound}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Trip Type:</span>
                <span className="text-sm text-gray-900">{bookingData.tripType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Language:</span>
                <span className="text-sm text-gray-900">{bookingData.language}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <Button
            size="sm"
            variant="light"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Trip Code: {bookingData.tripCode}
          </Button>
          <button
            onClick={() => copyToClipboard(bookingData.tripCode)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <button
          onClick={() => toggleSection("tripDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Trip Details (Excursion Details)
            </h3>
          </div>
          {expandedSections.tripDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.tripDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 space-y-4 pt-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                <span>🚤</span>
                Vehicle Detail
              </h4>
              <p className="text-sm text-gray-700">{bookingData.vehicleDetail}</p>
              <p className="text-sm text-gray-700">{bookingData.vehiclePlate}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4" />
                Personnel Detail
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  Captain: {bookingData.captain.name}{" "}
                  <a
                    href={`tel:${bookingData.captain.phone}`}
                    className="text-blue-600 underline"
                  >
                    {bookingData.captain.phone}
                  </a>
                </p>
                <p className="text-gray-700">
                  Captain Assistance 1: {bookingData.assistant.name}{" "}
                  <a
                    href={`tel:${bookingData.assistant.phone}`}
                    className="text-blue-600 underline"
                  >
                    {bookingData.assistant.phone}
                  </a>
                </p>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Guide Detail
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  Guide 1: {bookingData.guide1.name}{" "}
                  <a
                    href={`tel:${bookingData.guide1.phone}`}
                    className="text-blue-600 underline"
                  >
                    {bookingData.guide1.phone}
                  </a>
                </p>
                <p className="text-gray-700">
                  Guide 2: {bookingData.guide2.name}{" "}
                  <a
                    href={`tel:${bookingData.guide2.phone}`}
                    className="text-blue-600 underline"
                  >
                    {bookingData.guide2.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transport Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection("transportDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">
            Transport Details
          </h3>
          {expandedSections.transportDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.transportDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Pick-Up */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="light"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Transport Code: TF25A956
                  </Button>
                  <button
                    onClick={() => copyToClipboard("TF25A956")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Pick - Up
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>🚤</span> Vehicle Detail:
                    </span>
                    <p className="text-gray-700">{bookingData.pickUpVehicle}</p>
                    <p className="text-gray-700">กข1234</p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" /> Personnel Detail:
                    </span>
                    <p className="text-gray-700">
                      Driver: {bookingData.pickUpDriver.name}{" "}
                      <a
                        href={`tel:${bookingData.pickUpDriver.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.pickUpDriver.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <UserIcon className="w-4 h-4" /> Guide Detail:
                    </span>
                    <p className="text-gray-700">
                      Guide 1: {bookingData.pickUpGuide1.name}{" "}
                      <a
                        href={`tel:${bookingData.pickUpGuide1.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.pickUpGuide1.phone}
                      </a>
                    </p>
                    <p className="text-gray-700">
                      Guide 2: {bookingData.pickUpGuide2.name}{" "}
                      <a
                        href={`tel:${bookingData.pickUpGuide2.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.pickUpGuide2.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop-off */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="light"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Transport Code: TF25A956
                  </Button>
                  <button
                    onClick={() => copyToClipboard("TF25A956")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Drop - off
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>🚤</span> Vehicle Detail:
                    </span>
                    <p className="text-gray-700">{bookingData.dropOffVehicle}</p>
                    <p className="text-gray-700">กข1234</p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" /> Personnel Detail:
                    </span>
                    <p className="text-gray-700">
                      Driver: {bookingData.dropOffDriver.name}{" "}
                      <a
                        href={`tel:${bookingData.dropOffDriver.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.dropOffDriver.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <UserIcon className="w-4 h-4" /> Guide Detail:
                    </span>
                    <p className="text-gray-700">
                      Guide 1: {bookingData.dropOffGuide1.name}{" "}
                      <a
                        href={`tel:${bookingData.dropOffGuide1.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.dropOffGuide1.phone}
                      </a>
                    </p>
                    <p className="text-gray-700">
                      Guide 2: {bookingData.dropOffGuide2.name}{" "}
                      <a
                        href={`tel:${bookingData.dropOffGuide2.phone}`}
                        className="text-blue-600 underline"
                      >
                        {bookingData.dropOffGuide2.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection("customerDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Customer Details
            </h3>
          </div>
          {expandedSections.customerDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.customerDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Customer name
                </label>
                <input
                  type="text"
                  value={bookingData.customerName}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Nationality
                </label>
                <input
                  type="text"
                  value={bookingData.nationality}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="text"
                  value={bookingData.email}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Phone number
                </label>
                <input
                  type="text"
                  value={bookingData.phone}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Contact method
                </label>
                <input
                  type="text"
                  value={bookingData.contactMethod}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block"></label>
                <input
                  type="text"
                  value="ABCD"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unit Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection("unitDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Unit Details</h3>
          </div>
          {expandedSections.unitDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.unitDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 text-gray-500 font-medium">
                    Unit
                  </th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">
                    Price
                  </th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">
                    Quantity
                  </th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">
                    KB
                  </th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookingData.units.map((unit, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="py-2.5 text-gray-900">{unit.type}</td>
                    <td className="text-right py-2.5 text-gray-900">
                      {unit.price.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 text-gray-900">
                      {unit.quantity}
                    </td>
                    <td className="text-right py-2.5 text-gray-900">
                      ฿ {unit.kb.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 text-gray-900">
                      ฿ {unit.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-end items-center gap-2">
                <span className="text-blue-600 font-medium">Sub total:</span>
                <span className="text-blue-600 font-medium">
                  ฿ {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-2 flex justify-end items-center gap-2">
                <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Discount:</span>
                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ฿ {discount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-xs text-gray-600 mb-1">Total Pax</div>
                <div className="text-xl font-bold text-green-700">
                  {bookingData.bookingQuantity}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-xs text-gray-600 mb-1">Total KB</div>
                <div className="text-xl font-bold text-orange-700">
                  ฿ {totalKB.toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-1">Total Price</div>
                <div className="text-xl font-bold text-blue-700">
                  ฿ {totalPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection("locationDetails")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Location Details
            </h3>
          </div>
          {expandedSections.locationDetails ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.locationDetails && (
          <div className="px-4 pb-4 border-t border-gray-200 space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Meeting point location
                </label>
                <input
                  type="text"
                  value={bookingData.meetingPoint}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Pick up location
                </label>
                <input
                  type="text"
                  value={bookingData.pickUpLocation}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Pick-up Address
              </label>
              <input
                type="text"
                value={bookingData.pickUpAddress}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Drop - off point
                </label>
                <input
                  type="text"
                  value={bookingData.dropOffPoint}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Drop off remark
                </label>
                <input
                  type="text"
                  value={bookingData.dropOffRemark}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remark */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Remark</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Enter remark..."
        />
      </div>

      {/* No Show Modal */}
      <NoShowModal
        isOpen={showNoShowModal}
        onClose={() => setShowNoShowModal(false)}
        checkInPax={checkInPax}
        bookingQuantity={bookingData.bookingQuantity}
        noShowPax={noShowPax}
        bookingNo={bookingData.bookingNo}
        travelDate={bookingData.travelDate}
        tripRound={bookingData.tripRound}
        pricePerPax={bookingData.units.find((u) => u.quantity > 0)?.price || 1500}
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
