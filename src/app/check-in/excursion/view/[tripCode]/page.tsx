"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Input, Button } from "@heroui/react";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  CheckCircleIcon,
  CheckIcon,
  XCircleIcon,
  DocumentTextIcon,
  TruckIcon,
  UserIcon,
  UserCircleIcon,
  MapIcon,
  MapPinIcon,
  GlobeAltIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import WarningModal from "../../../../components/WarningModal";
import LoadingModal from "../../../../components/LoadingModal";
import SuccessModal from "../../../../components/SuccessModal";
import NoShowModal from "../../../../components/NoShowModal";
import CheckInModal from "../../../../components/CheckInModal";
import { getTripDetail, type TripPerson } from "@/app/lib/check-in-trip";

// ─── Summary Card Icons (ตรงกับ Check In List — SVG จาก Figma) ─────────────────
const IconWaiting = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M15.241 2H8.76101C5.00101 2 4.71101 5.38 6.74101 7.22L17.261 16.78C19.291 18.62 19.001 22 15.241 22H8.76101C5.00101 22 4.71101 18.62 6.74101 16.78L17.261 7.22C19.291 5.38 19.001 2 15.241 2Z" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCompleted = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3.62166 8.49C5.59166 -0.169998 18.4217 -0.159997 20.3817 8.5C21.5317 13.58 18.3717 17.88 15.6017 20.54C13.5917 22.48 10.4117 22.48 8.39166 20.54C5.63166 17.88 2.47166 13.57 3.62166 8.49Z" stroke="#1CB579" strokeWidth={1.5} />
    <path d="M9.25 11.5L10.75 13L14.75 9" stroke="#1CB579" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconNoShow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M18.4098 18.0898L15.5898 20.9098" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.4098 20.9098L15.5898 18.0898" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.1586 10.87C12.0586 10.86 11.9386 10.86 11.8286 10.87C9.44859 10.79 7.55859 8.84 7.55859 6.44C7.55859 3.99 9.53859 2 11.9986 2C14.4486 2 16.4386 3.99 16.4386 6.44C16.4286 8.84 14.5386 10.79 12.1586 10.87Z" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.0008 21.8097C10.1808 21.8097 8.37078 21.3497 6.99078 20.4297C4.57078 18.8097 4.57078 16.1697 6.99078 14.5597C9.74078 12.7197 14.2508 12.7197 17.0008 14.5597" stroke="#D91616" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAmountPax = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M9.15859 10.87C9.05859 10.86 8.93859 10.86 8.82859 10.87C6.44859 10.79 4.55859 8.84 4.55859 6.44C4.55859 3.99 6.53859 2 8.99859 2C11.4486 2 13.4386 3.99 13.4386 6.44C13.4286 8.84 11.5386 10.79 9.15859 10.87Z" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.4112 4C18.3512 4 19.9112 5.57 19.9112 7.5C19.9112 9.39 18.4113 10.93 16.5413 11C16.4613 10.99 16.3713 10.99 16.2812 11" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.15875 14.56C1.73875 16.18 1.73875 18.82 4.15875 20.43C6.90875 22.27 11.4188 22.27 14.1688 20.43C16.5888 18.81 16.5888 16.17 14.1688 14.56C11.4288 12.73 6.91875 12.73 4.15875 14.56Z" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14" stroke="#007800" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Itinerary items สำหรับ Itinerary Detail (Phi Phi / Phuket) */
const ITINERARY_ITEMS: { time: string; type: "start" | "travel" | "end"; lines: string[] }[] = [
  { time: "08 : 30", type: "start", lines: ["ต้อนรับคุณที่ Boat Ramp Pier, ภูเก็ต พร้อมบริการของว่างและเครื่องดื่มหลากหลาย", "ลงทะเบียน Check-in และรับอุปกรณ์ Snorkeling Gear"] },
  { time: "09 : 00", type: "travel", lines: ["ออกเดินทางจากท่าเรือไปยัง Phi Phi Island โดยเรือ Speedboat"] },
  { time: "10 : 00", type: "travel", lines: ["เดินทางถึง Bamboo Island หนึ่งในจุดที่สวยที่สุดของทะเลอันดามัน", "หาดทรายขาวและน้ำทะเลสีฟ้าใสผสมผสานกันอย่างลงตัว", "เพลิดเพลินกับการว่ายน้ำ, ดำน้ำตื้น, อาบแดด, หรือเดินเล่นบริเวณชายหาด"] },
  { time: "12 : 30", type: "travel", lines: ["รับประทานอาหารกลางวันแสนอร่อยที่ร้านอาหารริมหาดบน Phi Phi Don Island", "และพักผ่อนตามอัธยาศัยบนชายหาด"] },
  { time: "14 : 00", type: "travel", lines: ["ผ่อนคลายและว่ายน้ำใน the emerald lagoon ที่ Pileh Lagoon", "แวะชมลิงที่ Monkey Beach จากนั้นล่องเรือชมวิวบริเวณด้านนอกของ Viking Cave"] },
  { time: "15 : 00", type: "travel", lines: ["เดินทางถึง Maya Bay สถานที่ถ่ายทำภาพยนตร์เรื่อง The Beach", "พักผ่อนบนชายหาด และสนุกกับน้ำทะเลใส"] },
  { time: "16 : 00", type: "travel", lines: ["เดินทางกลับภูเก็ตพร้อมความประทับใจ"] },
  { time: "17 : 00", type: "end", lines: ["เดินทางถึง Boat Ramp Pier และส่งกลับโรงแรม"] },
];

/** Itinerary items (English) for ENG tab */
const ITINERARY_ITEMS_ENG: { time: string; type: "start" | "travel" | "end"; lines: string[] }[] = [
  { time: "08 : 30", type: "start", lines: ["Welcome you to Boat Ramp Pier, Phuket. Serve your snacks and a variety of drinks. Check-in and pick up your snorkeling gear"] },
  { time: "09 : 00", type: "travel", lines: ["Depart from the pier to Phi Phi Island by speedboat"] },
  { time: "10 : 00", type: "travel", lines: ["Arrive at Bamboo Island. One of the most beautiful spots in the Andaman Sea, White sands and turquoise waters blend seamlessly for a marvelous view. Enjoy your time for swimming, snorkeling, sunbath, or walking around a beautiful area"] },
  { time: "12 : 30", type: "travel", lines: ["Enjoy a great lunch at a beachside restaurant on Phi Phi Don Island and have free time on the beach"] },
  { time: "14 : 00", type: "travel", lines: ["Relaxing and swimming in the emerald lagoon at Pileh Lagoon. Go to Monkey Beach, then go sightseeing outside at Viking cave"] },
  { time: "15 : 00", type: "travel", lines: ["Arrive at Maya Bay where the movie \"The Beach\" was filmed. Relaxing on the beach and crystal clear water"] },
  { time: "16 : 00", type: "travel", lines: ["Back to Phuket with the impression"] },
  { time: "17 : 00", type: "end", lines: ["Arrive at Boat Ramp Pier and go back to your hotel"] },
];

/** Itinerary สำหรับ Trip Code EC2581C4 (Damnoen Saduak / Central World) — ภาษาไทย */
const ITINERARY_EC2581C4_TH: { time: string; type: "start" | "travel" | "end"; lines: string[] }[] = [
  { time: "07 : 30", type: "start", lines: ["ออกเดินทางจากเซ็นทรัลเวิลด์ (โซน Hug Thai)"] },
  { time: "09 : 40", type: "travel", lines: ["เดินทางถึงตลาดน้ำดำเนินสะดวก"] },
  { time: "11 : 30", type: "travel", lines: ["ออกเดินทางจากตลาดน้ำดำเนินสะดวก"] },
  { time: "12 : 00", type: "travel", lines: ["แวะที่ Buffalo Café (ไม่เกิน 1 ชั่วโมง)"] },
  { time: "13 : 10", type: "travel", lines: ["เดินทางไปตลาดร่มหุบแม่กลอง (~20–25 นาที)"] },
  { time: "13 : 35", type: "travel", lines: ["เดินเล่น / อิสระในการถ่ายภาพ"] },
  { time: "14 : 30", type: "travel", lines: ["ชมขบวนรถไฟวิ่งผ่านตลาด"] },
  { time: "15 : 00", type: "travel", lines: ["เดินทางกลับกรุงเทพฯ"] },
  { time: "17 : 00–17 : 30", type: "end", lines: ["ถึงกรุงเทพฯ (ขึ้นอยู่กับสภาพการจราจร)"] },
];

/** Itinerary สำหรับ Trip Code EC2581C4 — ENG */
const ITINERARY_EC2581C4_ENG: { time: string; type: "start" | "travel" | "end"; lines: string[] }[] = [
  { time: "07 : 30", type: "start", lines: ["Depart from CentralWorld (Hug Thai Zone)"] },
  { time: "09 : 40", type: "travel", lines: ["Arrive at Damnoen Saduak"] },
  { time: "11 : 30", type: "travel", lines: ["Depart from Damnoen Saduak Floating Market"] },
  { time: "12 : 00", type: "travel", lines: ["Stop at Buffalo Café (max. 1 hr)"] },
  { time: "13 : 10", type: "travel", lines: ["Depart to Maeklong Railway Market (~20–25 mins)"] },
  { time: "13 : 35", type: "travel", lines: ["Walk around / Free time for photos"] },
  { time: "14 : 30", type: "travel", lines: ["Watch the train arrival at the market"] },
  { time: "15 : 00", type: "travel", lines: ["Return to Bangkok"] },
  { time: "17 : 00–17 : 30", type: "end", lines: ["Arrive in Bangkok (depending on traffic)"] },
];

/** Itinerary สำหรับ Trip Code EC255D2C (ท่าเตียน / วัดอรุณ ฯลฯ) — ภาษาไทย */
const ITINERARY_EC255D2C_TH: { time: string; type: "start" | "travel" | "end"; lines: string[] }[] = [
  { time: "08 : 45", type: "start", lines: ["นัดพบลูกค้าที่ท่าเตียน (ค่าน้ำ 10 บาท/ผ้าเย็น 12 บาท)"] },
  { time: "09 : 00", type: "travel", lines: ["นั่งเรือข้ามฟากไปยังวัดอรุณราชวราราม (ค่าเรือ 10 THB/PAX)"] },
  { time: "10 : 30", type: "travel", lines: ["เยี่ยมชมวัดพระเชตุพนวิมลมังคลาราม (วัดโพธิ์)"] },
  { time: "12 : 00", type: "travel", lines: ["รับประทานอาหารกลางวันที่ท่าเตียน (ลูกค้าออกค่าใช้จ่ายเอง)"] },
  { time: "13 : 00", type: "travel", lines: ["เยี่ยมชมวัดพระศรีรัตนศาสดาราม"] },
  { time: "15 : 00", type: "end", lines: ["จบทริปโดยสวัสดิภาพที่วัดพระศรีรัตนศาสดาราม"] },
];

/**
 * Status ของ Booking:
 * - waiting: ยังไม่ทำอะไร รอคน Check In
 * - waitingReason: Check In แล้วแต่รอใส่ข้อมูล
 * - noShow: Check In แล้วแต่ไม่มา
 * - checkedIn (แสดงใน UI เป็น "Completed"): สำเร็จ
 */
interface Booking {
  id: string;
  bookingNo: string;
  program: string;
  option: string;
  customerName: string;
  phone: string;
  pax: number;
  checkIn: number;
  noShow: number;
  language: string;
  status: "waiting" | "waitingReason" | "checkedIn" | "noShow" | "rescheduled";
  checkedInTime?: string;
  remark?: string;
  noShowCondition?: string;
}

export default function CheckInViewPage() {
  const params = useParams();
  const router = useRouter();
  const tripCode = params.tripCode as string;
  const pathname = usePathname();
  const isTransportFlow = pathname.includes("/check-in/transport/");
  const flowLabel = isTransportFlow ? "Transport" : "Excursion";

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(true);
  const [fabHover, setFabHover] = useState(false);
  const [noShowModalFromAddCondition, setNoShowModalFromAddCondition] = useState(false);
  const [warningVariant, setWarningVariant] = useState<"checkIn" | "fullCharge" | "reschedule" | "refund">("checkIn");
  const [successVariant, setSuccessVariant] = useState<"checkIn" | "fullCharge" | "reschedule" | "refund">("checkIn");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    itinerary: false,
    booking: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [itineraryLang, setItineraryLang] = useState<"th" | "en">("th");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
  const pendingCheckInBookingIdRef = useRef<string | null>(null);
  const pendingNoShowRef = useRef<{ bookingId: string; noShowPax: number; originalPax: number } | null>(null);
  const pendingNoShowFromCheckInRef = useRef<number | null>(null);
  const pendingOriginalBookingRef = useRef<{ bookingId: string; checkIn: number; noShow: number; status: Booking["status"] } | null>(null);
  const pendingRescheduleRef = useRef<{ bookingId: string; payload: unknown } | null>(null);
  const pendingRefundRef = useRef<{ bookingId: string; payload: unknown } | null>(null);
  const pendingBulkCheckInIdsRef = useRef<string[] | null>(null);

  const revertPendingCheckInIfAny = () => {
    if (pendingOriginalBookingRef.current) {
      const { bookingId, checkIn, noShow, status } = pendingOriginalBookingRef.current;
      setBookingStates((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, checkIn, noShow, status } : b))
      );
    }
    pendingNoShowFromCheckInRef.current = null;
    pendingOriginalBookingRef.current = null;
  };

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedBookingIds(new Set());

  // ข้อมูลทริปตรงกับ Check-in List (Program, Pax, ฯลฯ) ต่อ tripCode
  const code = tripCode ?? "EC25Z1PW";
  const TRIP_DATA_FROM_LIST: Record<
    string,
    { travelDate: string; tripRound: string; program: string; totalPax: number; checkedInPax: number; status: string; remark: string }
  > = {
    EC25Z1PW: {
      travelDate: "17/12/2025",
      tripRound: "07:30",
      program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
      totalPax: 20,
      checkedInPax: 7,
      status: "Pending",
      remark: "",
    },
    EC2581C4: {
      travelDate: "17/12/2025",
      tripRound: "07:30",
      program: "Damnoen + Buffalo Cafe + Maeklong",
      totalPax: 39,
      checkedInPax: 38,
      status: "Pending",
      remark: "",
    },
    EC255D2C: {
      travelDate: "17/12/2025",
      tripRound: "00:00",
      program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
      totalPax: 20,
      checkedInPax: 10,
      status: "Pending",
      remark: "",
    },
    EC25ABC1: {
      travelDate: "16/12/2025",
      tripRound: "08:00",
      program: "Completed Trip Example",
      totalPax: 20,
      checkedInPax: 20,
      status: "Completed",
      remark: "",
    },
  };
  const tripDataFromList = TRIP_DATA_FROM_LIST[code];
  const tripData = tripDataFromList
    ? {
        tripCode: code,
        travelDate: tripDataFromList.travelDate,
        tripRound: tripDataFromList.tripRound,
        tripType: "Join In",
        program: tripDataFromList.program,
        remark: tripDataFromList.remark,
        status: tripDataFromList.status,
        totalPax: tripDataFromList.totalPax,
        checkedInPax: tripDataFromList.checkedInPax,
      }
    : {
        tripCode: code,
        travelDate: "17/12/2025",
        tripRound: "07:30",
        tripType: "Join In",
        program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
        remark: "",
        status: "Pending",
        totalPax: 20,
        checkedInPax: 8,
      };

  // Vehicle/Personnel/Guide จาก lib — Relate กับตาราง List (Vehicle : Registration, Name, Tel)
  const tripDetail = getTripDetail(code, isTransportFlow);
  // ตัวเลขในวงเล็บของ Vehicle = capacity (เช่น Speed Catamaran 2 engines (30) → 30)
  const vehicleCapacityMatch = tripDetail.vehicleName.match(/\((\d+)\)/);
  const vehicleCapacity = vehicleCapacityMatch ? parseInt(vehicleCapacityMatch[1], 10) : undefined;

  // Booking No. Pattern: TSB + MM(12) + YY(25) + HHMM (ปี 25 เดือน 12), Pax ไม่เกิน 8
  const bookingNo = (hhmm: string) => `TSB1225${hhmm}`;

  // Bookings ต่อ tripCode ให้ผลรวม Pax ตรงกับ List; แต่ละ booking pax ≤ 8
  const programByCode = (c: string) => TRIP_DATA_FROM_LIST[c]?.program ?? "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch";
  const bookingsByCode: Record<string, Booking[]> = {
    EC25Z1PW: [
      { id: "1", bookingNo: bookingNo("0730"), program: programByCode("EC25Z1PW"), option: "Day Trip with Shared Transfer including National Park Fee", customerName: "Yerik Trevor Tavarez", phone: "065-9016894", pax: 2, checkIn: 0, noShow: 0, language: "EN", status: "waiting", remark: "-" },
      { id: "2", bookingNo: bookingNo("0745"), program: programByCode("EC25Z1PW"), option: "Day Trip with Shared Transfer including National Park Fee", customerName: "Leanne Tague", phone: "+447708157027", pax: 2, checkIn: 0, noShow: 0, language: "EN", status: "waiting", remark: "-" },
      { id: "3", bookingNo: bookingNo("0800"), program: programByCode("EC25Z1PW"), option: "Day Trip with Shared Transfer including National Park Fee", customerName: "John Doe", phone: "065-9016895", pax: 1, checkIn: 0, noShow: 0, language: "EN", status: "waiting", remark: "-" },
      { id: "4", bookingNo: bookingNo("0815"), program: programByCode("EC25Z1PW"), option: "Day Trip with Shared Transfer including National Park Fee", customerName: "Jane Smith", phone: "065-9016896", pax: 8, checkIn: 7, noShow: 1, language: "EN", status: "waitingReason", remark: "-" },
      { id: "5", bookingNo: bookingNo("0830"), program: programByCode("EC25Z1PW"), option: "Day Trip with Shared Transfer including National Park Fee", customerName: "Joyce De Vos", phone: "+32472602889", pax: 7, checkIn: 0, noShow: 7, language: "EN", status: "noShow", remark: "-", noShowCondition: "No-show Full Charge" },
    ],
    EC2581C4: [
      { id: "1", bookingNo: bookingNo("0710"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group A1", phone: "081-1111111", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:15", remark: "-" },
      { id: "2", bookingNo: bookingNo("0725"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group A2", phone: "081-1111112", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:15", remark: "-" },
      { id: "3", bookingNo: bookingNo("0740"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group A3", phone: "081-1111113", pax: 4, checkIn: 4, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:15", remark: "-" },
      { id: "4", bookingNo: bookingNo("0755"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group B1", phone: "082-2222222", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:20", remark: "-" },
      { id: "5", bookingNo: bookingNo("0810"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group B2", phone: "082-2222223", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:20", remark: "-" },
      { id: "6", bookingNo: bookingNo("0825"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Group B3", phone: "082-2222224", pax: 2, checkIn: 2, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "07:20", remark: "-" },
      { id: "7", bookingNo: bookingNo("0840"), program: programByCode("EC2581C4"), option: "Day Trip", customerName: "Single Guest", phone: "083-3333333", pax: 1, checkIn: 0, noShow: 1, language: "EN", status: "waitingReason", remark: "-" },
    ],
    EC255D2C: [
      { id: "1", bookingNo: bookingNo("0805"), program: programByCode("EC255D2C"), option: "Full Day Tour", customerName: "Party A1", phone: "084-4444444", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "08:00", remark: "-" },
      { id: "2", bookingNo: bookingNo("0820"), program: programByCode("EC255D2C"), option: "Full Day Tour", customerName: "Party A2", phone: "084-4444445", pax: 2, checkIn: 2, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "08:00", remark: "-" },
      { id: "3", bookingNo: bookingNo("0835"), program: programByCode("EC255D2C"), option: "Full Day Tour", customerName: "Party B1", phone: "085-5555555", pax: 8, checkIn: 0, noShow: 0, language: "EN", status: "waiting", remark: "-" },
      { id: "4", bookingNo: bookingNo("0850"), program: programByCode("EC255D2C"), option: "Full Day Tour", customerName: "Party B2", phone: "085-5555556", pax: 2, checkIn: 0, noShow: 0, language: "EN", status: "waiting", remark: "-" },
    ],
    EC25ABC1: [
      { id: "1", bookingNo: bookingNo("0750"), program: programByCode("EC25ABC1"), option: "Day Trip", customerName: "Completed A", phone: "086-6666666", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "08:00", remark: "-" },
      { id: "2", bookingNo: bookingNo("0810"), program: programByCode("EC25ABC1"), option: "Day Trip", customerName: "Completed B", phone: "086-6666667", pax: 8, checkIn: 8, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "08:00", remark: "-" },
      { id: "3", bookingNo: bookingNo("0830"), program: programByCode("EC25ABC1"), option: "Day Trip", customerName: "Completed C", phone: "086-6666668", pax: 4, checkIn: 4, noShow: 0, language: "EN", status: "checkedIn", checkedInTime: "08:00", remark: "-" },
    ],
  };
  const bookings: Booking[] = bookingsByCode[code] ?? bookingsByCode.EC25Z1PW;

  const [bookingStates, setBookingStates] = useState(
    bookings.map((b) => ({
      ...b,
      checkIn: b.checkIn,
      noShow: b.noShow,
    }))
  );

  // เมื่อเปลี่ยน tripCode (เช่น จาก List กด View อีกทริป) ให้โหลด bookings ใหม่
  useEffect(() => {
    setBookingStates(
      bookings.map((b) => ({ ...b, checkIn: b.checkIn, noShow: b.noShow }))
    );
  }, [code]);

  const filteredBookings = bookingStates.filter((booking) => {
    // กรอง rescheduled bookings ออก (ไม่แสดงในรายการ Check In)
    if (booking.status === "rescheduled") return false;
    
    const matchesLanguage = booking.language === selectedLanguage;
    const matchesSearch =
      searchQuery === "" ||
      booking.bookingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesSearch;
  });

  // เรียง: Waiting → Waiting Reason → Completed → No show
  const statusOrder: Record<string, number> = {
    waiting: 0,
    waitingReason: 1,
    checkedIn: 2,
    noShow: 3,
  };
  const sortedBookings = [...filteredBookings].sort(
    (a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)
  );

  // Summary = Pax summary (ผลรวมจำนวนคนจาก bookingStates, ไม่นับ rescheduled)
  const activeBookings = bookingStates.filter((b) => b.status !== "rescheduled");
  const summaryWaiting = activeBookings.filter((b) => b.status === "waiting").reduce((sum, b) => sum + b.pax, 0);
  const summaryCheckedIn = activeBookings.reduce((sum, b) => sum + b.checkIn, 0);
  const summaryNoShow = activeBookings.reduce((sum, b) => sum + b.noShow, 0);
  const summaryAmountPax = activeBookings.reduce((sum, b) => sum + b.pax, 0);
  const summaryCheckedInPax = summaryCheckedIn;

  // สถานะทริป: ถ้าไม่มี Waiting / Waiting Reason (เหลือแค่ Completed กับ No Show) → Completed
  const hasWaitingOrReason = activeBookings.some((b) => b.status === "waiting" || b.status === "waitingReason");
  const tripStatusDisplay = hasWaitingOrReason ? "Pending" : "Completed";

  const handleCheckInChange = (bookingId: string, value: number) => {
    setBookingStates((prev) =>
      prev.map((booking) => {
        if (booking.id === bookingId && booking.status === "waiting") {
          // แก้ไขได้เฉพาะเมื่อ status เป็น "waiting" เท่านั้น
          const newCheckIn = Math.max(1, Math.min(value, booking.pax));
          const newNoShow = booking.pax - newCheckIn;
          return {
            ...booking,
            checkIn: newCheckIn,
            noShow: newNoShow,
          };
        }
        return booking;
      })
    );
  };

  const handleCheckIn = (booking: Booking) => {
    const currentBooking = bookingStates.find((b) => b.id === booking.id);
    if (!currentBooking) return;

    // ตรวจสอบว่าเป็น status "waiting" เท่านั้น
    if (currentBooking.status !== "waiting") return;

    if (currentBooking.noShow > 0) {
      setSelectedBooking(currentBooking);
        setNoShowModalFromAddCondition(false);
      setShowNoShowModal(true);
    } else {
      // อัปเดต status เป็น checkedIn
      setBookingStates((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: "checkedIn" as const,
                checkedInTime: new Date()
                  .toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .slice(0, 5),
              }
            : b
        )
      );
      setShowWarningModal(true);
    }
  };

  const processCheckIn = () => {
    const noShowPending = pendingNoShowRef.current;
    if (noShowPending) {
      const { bookingId, noShowPax, originalPax } = noShowPending;
      const newStatus = noShowPax === originalPax ? ("noShow" as const) : ("checkedIn" as const);
      const checkIn = originalPax - noShowPax;
      setBookingStates((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                noShow: noShowPax,
                checkIn,
                status: newStatus,
                noShowCondition: "No-show Full Charge",
                ...(newStatus === "checkedIn"
                  ? {
                      checkedInTime: new Date()
                        .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                        .slice(0, 5),
                    }
                  : {}),
              }
            : b
        )
      );
      pendingNoShowRef.current = null;
      setSelectedBooking(null);
      // commit แล้ว เคลียร์ pending check-in เดิม
      pendingNoShowFromCheckInRef.current = null;
      pendingOriginalBookingRef.current = null;
      setSuccessVariant("fullCharge");
    } else if (pendingRescheduleRef.current) {
      const { bookingId, payload } = pendingRescheduleRef.current;
      const wrap = payload && typeof payload === "object" ? (payload as { rescheduleData?: unknown }) : {};
      const data =
        wrap.rescheduleData && typeof wrap.rescheduleData === "object"
          ? (wrap.rescheduleData as { travelDate?: string; tripRound?: string; noShowPax?: number })
          : {};
      const booking = bookingStates.find((b) => b.id === bookingId);
      if (booking) {
        const origPax = booking.pax;
        const noShowPax = Number(data.noShowPax ?? 0);
        const travelDate = data.travelDate ?? tripData.travelDate;
        const tripRound = data.tripRound ?? tripData.tripRound;

        if (noShowPax >= origPax) {
          // กรณี Reschedule เต็มจำนวน: ย้าย Booking ไปทริปใหม่ (ไม่ต้องแสดงในหน้านี้)
          setBookingStates((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: "rescheduled" as const } : b))
          );
        } else {
          // กรณี Reschedule บางส่วน: ให้ Booking แสดงอยู่เดิมเป็นสถานะ Check-in
          // (มีทั้งคนมาและคน Reschedule) พร้อมบันทึกเงื่อนไข No-show เป็นรายละเอียด Reschedule
          const checkIn = origPax - noShowPax;
          const conditionText = `Reschedule to ${travelDate} : ${tripRound.replace(":", " : ")}`;
          setBookingStates((prev) =>
            prev.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    noShow: noShowPax,
                    checkIn,
                    status: "checkedIn" as const,
                    noShowCondition: conditionText,
                  }
                : b
            )
          );
        }
      }
      pendingRescheduleRef.current = null;
      setSelectedBooking(null);
      setSuccessVariant("reschedule");
      // commit แล้ว เคลียร์ pending check-in เดิม
      pendingNoShowFromCheckInRef.current = null;
      pendingOriginalBookingRef.current = null;
      pendingBulkCheckInIdsRef.current = null;
    } else if (pendingRefundRef.current) {
      const { bookingId, payload } = pendingRefundRef.current;
      const p = payload && typeof payload === "object" ? (payload as { noShowPax?: number }) : {};
      const n = Number(p.noShowPax ?? 0);
      const booking = bookingStates.find((b) => b.id === bookingId);
      if (booking) {
        const orig = booking.pax;
        const newStatus = n === orig ? ("noShow" as const) : ("checkedIn" as const);
        const checkIn = orig - n;
        setBookingStates((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  noShow: n,
                  checkIn,
                  status: newStatus,
                  noShowCondition: "Refund",
                }
              : b
          )
        );
      }
      pendingRefundRef.current = null;
      setSelectedBooking(null);
      setSuccessVariant("refund");
      // commit แล้ว เคลียร์ pending check-in เดิม
      pendingNoShowFromCheckInRef.current = null;
      pendingOriginalBookingRef.current = null;
      pendingBulkCheckInIdsRef.current = null;
    } else if (pendingBulkCheckInIdsRef.current && pendingBulkCheckInIdsRef.current.length > 0) {
      const idsToCheckIn = new Set(pendingBulkCheckInIdsRef.current);
      setBookingStates((prev) =>
        prev.map((b) =>
          idsToCheckIn.has(b.id) && b.status === "waiting"
            ? {
                ...b,
                checkIn: b.pax,
                noShow: 0,
                status: "checkedIn" as const,
                checkedInTime: new Date()
                  .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                  .slice(0, 5),
              }
            : b
        )
      );
      pendingBulkCheckInIdsRef.current = null;
      setSelectedBooking(null);
      setSelectedBookingIds(new Set());
      setSuccessVariant("checkIn");
      // ไม่เกี่ยวกับ pending check-in แบบเดี่ยว
      pendingNoShowFromCheckInRef.current = null;
      pendingOriginalBookingRef.current = null;
    } else {
      const bookingIdToConfirm = pendingCheckInBookingIdRef.current ?? selectedBooking?.id;
      if (bookingIdToConfirm) {
        setBookingStates((prev) =>
          prev.map((b) =>
            b.id === bookingIdToConfirm
              ? {
                  ...b,
                  status: "checkedIn" as const,
                  checkedInTime: new Date()
                    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    .slice(0, 5),
                }
              : b
          )
        );
        pendingCheckInBookingIdRef.current = null;
        setSelectedBooking(null);
        setSuccessVariant("checkIn");
      }
    }
    setShowWarningModal(false);
    setShowNoShowModal(false);
    setShowLoading(true);

    setTimeout(() => {
      setShowLoading(false);
      setShowSuccess(true);
    }, 1500);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out;
          }
        `
      }} />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Area - ดีไซน์ Excursion > Check In List > View */}
        <main className="flex-1 overflow-y-auto bg-[#F8F8F8] flex flex-col">
          <div className="container mx-auto px-6 py-8 flex-1 flex flex-col items-center gap-6 w-full">
            {/* Head 1: Breadcrumb + Actions — ตามดีไซน์ #B9B9B9 / #265ED6 */}
            <div data-property-1="Head 1" className="w-full max-w-[1616px] overflow-hidden flex justify-between items-center">
              <div className="flex justify-start items-center gap-2">
                <span className="text-[#B9B9B9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                  {flowLabel}
                </span>
                <ChevronRightIcon className="size-6 text-[#292D32] shrink-0" />
                <span className="text-[#B9B9B9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Check In List</span>
                <ChevronRightIcon className="size-6 text-[#292D32] shrink-0" />
                <span className="text-[#265ED6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 tracking-[0.03em]">View</span>
              </div>
              <div className="flex justify-start items-start gap-6">
                <div data-group="2" data-name="Normal 2" data-type="Default" className="px-4 py-2 bg-white rounded-lg border border-[#D9D9D9] inline-flex flex-col justify-start items-start gap-2.5">
                  <div className="flex justify-start items-center gap-2">
                    <DocumentTextIcon className="size-6 text-[#2A2A2A] shrink-0" />
                    <span className="w-[53px] text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Export</span>
                    <ChevronDownIcon className="size-6 text-[#2A2A2A] shrink-0" />
                  </div>
                </div>
                <div className="w-10 h-px bg-[#D9D9D9] shrink-0 self-center" aria-hidden />
                <button
                  onClick={() => router.push("/check-in/excursion/list")}
                  className="px-5 py-2 bg-white rounded-[100px] border border-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
                >
                  <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Close</span>
                </button>
              </div>
            </div>

            {/* Stats: Waiting, Completed, No show, Amount Pax — ตามดีไซน์ การ์ด flex-1, border #D9D9D9, ไอคอนสี */}
            <div className="w-full max-w-[1136px] flex justify-start items-center gap-6">
              <div className="flex-1 min-w-0 px-6 py-3 bg-white rounded-xl border border-[#D9D9D9] flex flex-col justify-start items-start gap-3">
                <div className="w-full flex justify-start items-start gap-4">
                  <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1A1A1A] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{summaryWaiting}</div>
                    <div className="text-[#1A1A1A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Waiting</div>
                  </div>
                  <div className="p-2.5 bg-[#FFF2CA] rounded-xl flex justify-center items-center shrink-0">
                    <IconWaiting />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 px-6 py-3 bg-white rounded-xl border border-[#D9D9D9] flex flex-col justify-start items-start gap-3">
                <div className="w-full flex justify-start items-start gap-4">
                  <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1A1A1A] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{summaryCheckedIn}</div>
                    <div className="text-[#1A1A1A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Completed</div>
                  </div>
                  <div className="p-2.5 bg-[#E6F3E6] rounded-xl flex justify-center items-center shrink-0">
                    <IconCompleted />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 px-6 py-3 bg-white rounded-xl border border-[#D9D9D9] flex flex-col justify-start items-start gap-3">
                <div className="w-full flex justify-start items-start gap-4">
                  <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1A1A1A] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{summaryNoShow}</div>
                    <div className="text-[#1A1A1A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">No show</div>
                  </div>
                  <div className="p-2.5 bg-[#FFC3C3] rounded-xl flex justify-center items-center shrink-0">
                    <IconNoShow />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 px-6 py-3 bg-white rounded-xl border border-[#D9D9D9] flex flex-col justify-start items-start gap-3">
                <div className="w-full flex justify-start items-start gap-4">
                  <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2">
                    <div className="text-[#1A1A1A] text-[28px] font-normal font-['IBM_Plex_Sans_Thai'] leading-10">{summaryAmountPax}</div>
                    <div className="text-[#1A1A1A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6">Amount Pax</div>
                  </div>
                  <div className="p-2.5 bg-[#E6F3E6] rounded-xl flex justify-center items-center shrink-0">
                    <IconAmountPax />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip info card — ตามดีไซน์ padding 48, rounded 16, pills #FD5C04/#1CB579/#265ED6, Pending #FFEFE6, 19/30 #F8F8F8 */}
            <div data-property-1="Default" className="w-full max-w-[1136px] px-12 py-6 bg-white rounded-2xl flex flex-col justify-start items-center gap-6 overflow-hidden">
              <div className="self-stretch flex justify-start items-center flex-wrap gap-6">
                <div className="flex-1 flex justify-start items-center gap-6 min-w-0">
                  <div className="flex justify-start items-center gap-2 flex-wrap">
                    <div data-property-1="Calendar" className="h-8 px-2 py-0.5 bg-white rounded-full border border-[#FD5C04] inline-flex items-center gap-1">
                      <CalendarIcon className="size-[18px] text-[#FD5C04] shrink-0" />
                      <span className="text-[#FD5C04] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{tripData.travelDate}</span>
                    </div>
                    <div data-property-1="Time" className="h-8 px-2 py-0.5 bg-white rounded-full border border-[#1CB579] inline-flex items-center gap-1">
                      <ClockIcon className="size-6 text-[#1CB579] shrink-0" />
                      <span className="text-[#1CB579] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] text-center">{tripData.tripRound.replace(":", " : ")}</span>
                    </div>
                    <div data-property-1="Variant4" className="h-8 px-2 py-0.5 bg-[#F8FCFF] rounded-full border border-[#265ED6] inline-flex items-center gap-1">
                      <UserGroupIcon className="size-5 text-[#265ED6] shrink-0" />
                      <span className="w-12 text-center text-[#265ED6] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{tripData.tripType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-3 shrink-0">
                  <div
                    data-property-1={tripStatusDisplay}
                    className={`px-2 py-0.5 rounded-2xl flex justify-center items-center gap-1 ${
                      tripStatusDisplay === "Completed" ? "bg-[#E6F7F0]" : "bg-[#FFEFE6]"
                    }`}
                  >
                    <div
                      className="size-2.5 rounded-full"
                      style={{ background: tripStatusDisplay === "Completed" ? "#1CB579" : "#FD5C04" }}
                    />
                    <span
                      className="text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] text-center"
                      style={{ color: tripStatusDisplay === "Completed" ? "#1CB579" : "#FD5C04" }}
                    >
                      {tripStatusDisplay}
                    </span>
                  </div>
                  <div data-property-1="Default" className="px-2 py-1 bg-[#F8F8F8] rounded-[30px] inline-flex items-center gap-1">
                    <UserGroupIcon className="size-5 text-[#265ED6] shrink-0" />
                    <span className="text-[#142B41] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] text-right" title="จำนวน Pax ที่จัดกรุ๊ปเข้ามา / ความจุ Vehicle (ตัวเลขในวงเล็บ)">{summaryAmountPax}/{vehicleCapacity ?? summaryAmountPax}</span>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="flex justify-start items-center gap-2">
                  <DocumentTextIcon className="size-6 text-[#265ED6] shrink-0" />
                  <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Trip Code No. {tripData.tripCode}</span>
                </div>
                <div className="self-stretch flex justify-start items-start gap-6 flex-wrap">
                  <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em] shrink-0">Program name</span>
                  <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 shrink-0">: </span>
                  <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">{tripData.program}</span>
                </div>
                <div className="self-stretch flex justify-start items-start gap-6 flex-wrap">
                  <span className="w-[108px] text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em] shrink-0">Remark</span>
                  <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 shrink-0">: </span>
                  <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 min-w-0">{tripData.remark || "-"}</span>
                </div>
              </div>
            </div>

            {/* Itinerary Detail — ตามรูปและ reference */}
            <div className="w-full max-w-[1136px] px-12 py-6 bg-white rounded-2xl inline-flex flex-col justify-start items-center gap-6 overflow-hidden">
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <button
                  type="button"
                  onClick={() => toggleSection("itinerary")}
                  className="self-stretch inline-flex justify-start items-center gap-2"
                >
                  <div className="w-8 h-8 flex justify-center items-center text-[#265ed6] shrink-0">
                    <MapPinIcon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 justify-start text-[#265ed6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7 text-left">Itinerary Detail</span>
                  <div className="flex justify-center items-center gap-12">
                    {expandedSections.itinerary ? (
                      <ChevronUpIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-[#292d32]" strokeWidth={1.5} />
                    )}
                  </div>
                </button>
                {expandedSections.itinerary && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch inline-flex justify-start items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setItineraryLang("th")}
                        className={`p-2 inline-flex flex-col justify-start items-start gap-2.5 ${itineraryLang === "th" ? "border-b-4 border-[#fe7931]" : "rounded-sm"}`}
                      >
                        <span className={itineraryLang === "th" ? "text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight" : "text-[#d9d9d9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"}>
                          ภาษาไทย
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setItineraryLang("en")}
                        className={`p-2 rounded-sm flex justify-center items-center gap-2 ${itineraryLang === "en" ? "border-b-4 border-[#fe7931]" : ""}`}
                      >
                        <span className={itineraryLang === "en" ? "text-[#265ed6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight" : "text-[#d9d9d9] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight"}>
                          ENG
                        </span>
                      </button>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {tripCode === "EC255D2C" && itineraryLang === "en" ? (
                        <div className="self-stretch px-6 py-12 flex flex-col justify-center items-center gap-4">
                          <img
                            src="/no-itinerary-en.png"
                            alt="No information available"
                            className="max-w-[200px] w-full h-auto object-contain"
                          />
                          <span className="text-[#676363] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-5">No information available</span>
                        </div>
                      ) : (
                        (() => {
                          const items = tripCode === "EC255D2C"
                            ? ITINERARY_EC255D2C_TH
                            : tripCode === "EC2581C4"
                              ? (itineraryLang === "en" ? ITINERARY_EC2581C4_ENG : ITINERARY_EC2581C4_TH)
                              : (itineraryLang === "en" ? ITINERARY_ITEMS_ENG : ITINERARY_ITEMS);
                          return items.map((item, index) => {
                            const isFirstTravel = item.type === "travel" && items.findIndex((i) => i.type === "travel") === index;
                            return (
                        <React.Fragment key={index}>
                          {item.type === "start" && (
                            <div className="self-stretch px-6 pt-6 opacity-80 flex flex-col justify-start items-start gap-2 overflow-hidden">
                              <div className="inline-flex justify-start items-center gap-3 flex-wrap">
                                <div className="w-8 h-8 bg-sky-50 rounded-full flex justify-center items-center shrink-0">
                                  <MapPinIcon className="w-5 h-5 text-[#0ba4eb]" strokeWidth={1.5} />
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                  <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{item.time}</span>
                                </div>
                                <div className="w-2 h-2 bg-[#2a2a2a] rounded-full shrink-0" />
                                <div className="flex justify-center items-center gap-2 min-w-0 flex-1">
                                  <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                    {item.lines.join(" ")}
                                  </span>
                                </div>
                              </div>
                              <div className="self-stretch h-0 border-t border-[#d9d9d9]" />
                            </div>
                          )}
                          {item.type === "travel" && (
                            <div className={`self-stretch px-6 opacity-80 flex flex-col justify-start items-start gap-2 overflow-hidden ${isFirstTravel ? "pt-6" : "pt-0"}`}>
                              <div className="flex flex-col justify-start items-start gap-2">
                                <div className="inline-flex justify-start items-center gap-3">
                                  <div className="w-8 h-8 bg-[#ebfdf2] rounded-full flex justify-center items-center shrink-0">
                                    <UserIcon className="w-5 h-5 text-[#12b669]" strokeWidth={1.5} />
                                  </div>
                                  <div className="flex justify-center items-center gap-2">
                                    <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{item.time}</span>
                                  </div>
                                </div>
                                <div className="pl-[46px] flex flex-col justify-start items-start gap-1">
                                  {item.lines.map((line, i) => (
                                    <div key={i} className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                      {line}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {item.type === "end" && (
                            <>
                              <div className="self-stretch px-6">
                                <div className="self-stretch h-0 border-t border-[#d9d9d9]" />
                              </div>
                              <div className="self-stretch px-6 pt-6 opacity-80 flex flex-col justify-start items-start gap-2 overflow-hidden">
                                <div className="inline-flex justify-start items-center gap-3 flex-wrap">
                                  <div className="w-8 h-8 bg-sky-50 rounded-full flex justify-center items-center shrink-0">
                                    <MapPinIcon className="w-5 h-5 text-[#0ba4eb]" strokeWidth={1.5} />
                                  </div>
                                  <div className="flex justify-center items-center gap-2">
                                    <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">{item.time}</span>
                                  </div>
                                  <div className="w-2 h-2 bg-[#2a2a2a] rounded-full shrink-0" />
                                  <div className="flex justify-center items-center gap-2 min-w-0 flex-1">
                                    <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">
                                      {item.lines.join(" ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </React.Fragment>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Detail — ตามดีไซน์ width 1136, padding 48/24, gap 12, #265ED6, #006AFF, Search 250 #D9D9D9 */}
            <div data-property-1="Default" className="w-full max-w-[1136px] px-12 py-6 bg-white rounded-2xl inline-flex flex-col justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSection("booking")}
                className="self-stretch inline-flex justify-start items-center gap-2 text-left"
                aria-expanded={expandedSections.booking}
              >
                <DocumentTextIcon className="size-6 text-[#265ED6] shrink-0" aria-hidden />
                <span className="flex-1 text-[#265ED6] text-lg font-semibold font-['IBM_Plex_Sans_Thai'] leading-7">Booking Detail</span>
                <div className="flex justify-center items-center gap-12">
                  {expandedSections.booking ? (
                    <ChevronUpIcon className="size-6 text-[#2A2A2A]" />
                  ) : (
                    <ChevronDownIcon className="size-6 text-[#2A2A2A]" />
                  )}
                </div>
              </button>
              {expandedSections.booking && (
                <>
                  <div className="self-stretch inline-flex justify-start items-center gap-[10px]">
                    <div className="flex-1 flex justify-start items-center gap-[18px]">
                      <span className="text-[#006AFF] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Language :</span>
                      <div className="flex justify-start items-center gap-2">
                        <span className="text-[#2A2A2A] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">EN {filteredBookings.reduce((sum, b) => sum + b.pax, 0)}</span>
                      </div>
                    </div>
                    <div data-property-1="Search no filter" className="w-[250px] h-10 relative bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#D9D9D9] flex items-center pl-3">
                      <MagnifyingGlassIcon className="size-6 text-[#676363] shrink-0" />
                      <input
                        type="text"
                        placeholder="Search Booking"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 min-w-0 text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em] bg-transparent border-0 outline-none placeholder:text-[#B9B9B9]"
                      />
                    </div>
                  </div>

                  {/* Selected bookings bar — แสดงเมื่อมีรายการที่เลือก */}
                  {selectedBookingIds.size > 0 && (
                    <div className="self-stretch pt-3 pb-3 overflow-hidden rounded-t-lg flex justify-end items-center gap-3">
                      <div className="flex-1 h-6 relative">
                        <span className="text-[#006AFF] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                          {selectedBookingIds.size} Booking Selected
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="px-5 py-2 rounded-[100px] border border-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
                      >
                        <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Clear</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const ids = Array.from(selectedBookingIds);
                          if (ids.length === 0) return;

                          // เก็บรายการ bookingId ที่จะทำ Bulk Check-in (เฉพาะ status waiting)
                          const waitingIds = ids.filter((id) => {
                            const b = bookingStates.find((bk) => bk.id === id);
                            return b && b.status === "waiting";
                          });

                          if (waitingIds.length === 0) return;

                          pendingBulkCheckInIdsRef.current = waitingIds;
                          // เคสนี้เป็นการ Check-in เต็ม pax ของทุก booking ที่เลือก
                          setWarningVariant("checkIn");
                          setShowWarningModal(true);
                        }}
                        className="px-5 py-2 bg-[#1CB579] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <CheckIcon className="size-6 text-white shrink-0" strokeWidth={2.5} />
                        <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">Check - In</span>
                      </button>
                    </div>
                  )}

                  {/* Booking List - ตรงดีไซน์ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {sortedBookings.map((booking) => {
                      const isWhite = booking.status === "waiting" || booking.status === "waitingReason";
                      const cardClass = isWhite
                        ? "w-full max-w-[1040px] px-4 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#EAECF0] flex flex-col justify-start items-start gap-3 overflow-hidden"
                        : "w-full max-w-[1040px] px-4 py-2 bg-[#F8F8F8] rounded-lg flex flex-col justify-start items-start gap-3 overflow-hidden";
                      const statusLabel =
                        booking.status === "waiting"
                          ? "Waiting"
                          : booking.status === "waitingReason"
                            ? "Waiting reason"
                            : booking.status === "checkedIn"
                              ? "Completed"
                              : "No show";
                      const statusDataProp =
                        booking.status === "waiting"
                          ? "Waiting"
                          : booking.status === "waitingReason"
                            ? "Waiting reason"
                            : booking.status === "checkedIn"
                              ? "Completed"
                              : "No show";
                      const statusPillClass =
                        booking.status === "waiting" || booking.status === "waitingReason"
                          ? "min-w-[126px] h-7 p-2 bg-[#FFF8E5] rounded-[100px] flex justify-center items-center gap-2 shrink-0"
                          : booking.status === "checkedIn"
                            ? "min-w-[126px] h-7 p-2 bg-[#E6F3E6] rounded-[100px] flex justify-center items-center gap-2 shrink-0"
                            : "min-w-[126px] h-7 p-2 bg-[#FFE8E5] rounded-[100px] flex justify-center items-center gap-2 shrink-0";
                      const statusDotClass =
                        booking.status === "waiting" || booking.status === "waitingReason"
                          ? "size-2 bg-[#FFC107] rounded-full"
                          : booking.status === "checkedIn"
                            ? "size-2 bg-[#1CB579] rounded-full"
                            : "size-2 bg-[#D91616] rounded-full";
                      const statusTextClass =
                        booking.status === "waiting" || booking.status === "waitingReason"
                          ? "text-center text-[#FFC107] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] whitespace-nowrap"
                          : booking.status === "checkedIn"
                            ? "text-center text-[#1CB579] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] whitespace-nowrap"
                            : "text-center text-[#D91616] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] whitespace-nowrap";
                      const cardDataProp =
                        booking.status === "waiting"
                          ? "Default"
                          : booking.status === "waitingReason"
                            ? "Variant3"
                            : booking.status === "checkedIn"
                              ? "Variant2"
                              : "Variant4";
                      return (
                        <div key={booking.id} data-property-1={cardDataProp} className={cardClass}>
                          <div className="self-stretch inline-flex justify-start items-center gap-4">
                            {booking.status === "waiting" && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleBookingSelection(booking.id); }}
                                data-dark="True"
                                data-style="Outline"
                                data-checkbox-type="False"
                                className={`size-6 relative rounded border shrink-0 flex items-center justify-center transition-colors ${
                                  selectedBookingIds.has(booking.id)
                                    ? "bg-[#265ED6] border-[#265ED6]"
                                    : "bg-white border-[#265ED6]"
                                }`}
                              >
                                {selectedBookingIds.has(booking.id) && (
                                  <CheckIcon className="size-4 text-white" strokeWidth={3} />
                                )}
                              </button>
                            )}
                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                              <div className="inline-flex justify-start items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBooking(booking)}
                                  className="justify-start text-[#265ED6] text-base font-normal font-['IBM_Plex_Sans_Thai'] underline leading-6 tracking-[0.01em] text-left"
                                >
                                  {booking.bookingNo}
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-start items-center gap-6">
                              <div className="flex justify-start items-center gap-2">
                                <GlobeAltIcon className="size-4 text-[#2A2A2A] shrink-0" />
                                <div className="justify-start text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.language}</div>
                              </div>
                              <div data-property-1={statusDataProp} className={statusPillClass}>
                                <div className={statusDotClass} />
                                <div className={statusTextClass}>{statusLabel}</div>
                              </div>
                            </div>
                          </div>
                          <div className="self-stretch flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch inline-flex justify-start items-start gap-4">
                              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Program</div>
                                <div className="self-stretch text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.program}</div>
                              </div>
                              <div className="w-[200px] inline-flex flex-col justify-start items-start gap-1">
                                <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Option</div>
                                <div className="self-stretch text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.option}</div>
                              </div>
                              <div className="flex justify-start items-end gap-4">
                                <div className="w-[180px] inline-flex flex-col justify-start items-start gap-1">
                                  <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Customer Name</div>
                                  <div className="self-stretch text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.customerName}</div>
                                </div>
                                <div className="w-[120px] inline-flex flex-col justify-start items-start gap-1">
                                  <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Phone number</div>
                                  <div className="self-stretch text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.phone}</div>
                                </div>
                                <div className="w-[100px] flex justify-start items-start gap-1">
                                  <div className="flex justify-start items-center gap-1">
                                    <UserGroupIcon className="size-5 text-[#265ED6] shrink-0" />
                                    <div className="justify-center text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.pax}</div>
                                    <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Pax</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="self-stretch inline-flex justify-start items-start gap-1">
                              <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">Remark :</div>
                              <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">{booking.remark || "-"}</div>
                            </div>
                          </div>
                          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-[#D1D4DA]" />
                          {/* Total Check in + Time Stamp row */}
                          <div className="self-stretch rounded-lg inline-flex justify-start items-center gap-6">
                            <div className="flex-1 flex justify-start items-center gap-6">
                              <div className="text-[#2A2A2A] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">Total Check in</div>
                              <div className="flex justify-start items-center gap-3">
                                <div data-property-1="Completed" className="h-7 p-2 rounded-lg flex justify-start items-center gap-2">
                                  <div className="text-center text-[#1CB579] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">{booking.checkIn}</div>
                                  <div className="text-center text-[#1CB579] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">Check In</div>
                                </div>
                                <div data-property-1="Variant3" className="h-7 p-2 rounded-lg flex justify-start items-center gap-2">
                                  <div className="text-center text-[#D91616] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">{booking.noShow}</div>
                                  <div className="text-center text-[#D91616] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">No show</div>
                                </div>
                              </div>
                            </div>
                            {booking.status === "waiting" && (
                              <>
                                <button
                                  type="button"
                                  data-button-color="Red Primary"
                                  data-button-size="Size 32"
                                  data-button-state="Outline"
                                  onClick={() => {
                                    // ปิด modal อื่นๆ ทั้งหมดก่อนเปิด NoShowModal
                                    setShowWarningModal(false);
                                    setShowCheckInModal(false);
                                    setShowNoShowModal(false);
                                    // ตั้งค่า No Show ให้เท่ากับจำนวนทั้งหมด และข้ามหน้าเลือกจำนวนไปหน้า Condition ทันที
                                    pendingNoShowFromCheckInRef.current = booking.pax;
                                    setSelectedBooking(booking);
                                    setNoShowModalFromAddCondition(false);
                                    // เปิด NoShowModal หลังจากปิด modal อื่นๆ แล้ว
                                    setTimeout(() => setShowNoShowModal(true), 0);
                                  }}
                                  className="px-4 py-1 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#FF3B3B] flex justify-center items-center gap-2 hover:bg-red-50/50 transition-colors"
                                >
                                  <div className="size-6 relative overflow-hidden flex items-center justify-center">
                                    <XCircleIcon className="size-5 text-[#D91616]" />
                                  </div>
                                  <div className="text-[#D91616] text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">No Show</div>
                                </button>
                                <button
                                  type="button"
                                  data-button-color="Green Primary"
                                  data-button-size="Size 32"
                                  data-button-state="Enabled"
                                  onClick={() => {
                                    // ปิด modal อื่นๆ ทั้งหมดก่อนเปิด CheckInModal
                                    setShowWarningModal(false);
                                    setShowNoShowModal(false);
                                    setShowCheckInModal(false);
                                    setSelectedBooking(booking);
                                    // เปิด CheckInModal หลังจากปิด modal อื่นๆ แล้ว
                                    setTimeout(() => setShowCheckInModal(true), 0);
                                  }}
                                  className="px-4 py-1 bg-[#1CB579] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                  <CheckCircleIcon className="size-6 text-white shrink-0" />
                                  <div className="text-center text-white text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">Check - In</div>
                                </button>
                              </>
                            )}
                            {booking.status === "waitingReason" && (
                              <button
                                type="button"
                                data-button-color="Blue Primary"
                                data-button-size="Size 32"
                                data-button-state="Enabled"
                                onClick={() => {
                                  // ปิด modal อื่นๆ ทั้งหมดก่อนเปิด NoShowModal
                                  setShowWarningModal(false);
                                  setShowCheckInModal(false);
                                  setShowNoShowModal(false);
                                  setSelectedBooking(booking);
                                    setNoShowModalFromAddCondition(true);
                                  // เปิด NoShowModal หลังจากปิด modal อื่นๆ แล้ว
                                  setTimeout(() => setShowNoShowModal(true), 0);
                                }}
                                className="px-4 py-1 bg-[#265ED6] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                              >
                                <PencilSquareIcon className="size-6 text-white shrink-0" />
                                <div className="text-white text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-[0.02em]">Add Condition</div>
                              </button>
                            )}
                            {booking.status === "checkedIn" && (
                              <div className="flex justify-start items-center gap-2">
                                <ClockIcon className="size-4 text-[#848484] shrink-0" />
                                <span className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
                                  {tripData.travelDate}:{booking.checkedInTime || "00:00"}
                                </span>
                              </div>
                            )}
                            {booking.status === "noShow" && (
                              <div className="flex justify-start items-center gap-2">
                                <ClockIcon className="size-4 text-[#848484] shrink-0" />
                                <span className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
                                  {tripData.travelDate} : {tripData.tripRound.replace(":", " : ")}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* No-show Condition Row - แสดงเมื่อ booking นี้มี No Show */}
                          {booking.noShow > 0 && (
                            <div className="self-stretch inline-flex justify-start items-start gap-1 mt-2">
                              <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">
                                No-show Condition :
                              </div>
                              <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em]">
                                {booking.noShowCondition || "-"}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </main>

        {/* Floating Action Button - ซ่อนเมื่อป๊อปอัพเปิด กลับมาเมื่อกดกากบาท */}
        {!showDetailModal && (
        <div className="fixed bottom-8 right-8 flex items-center gap-3 z-40">
          {/* Tooltip: โชว์เมื่อโฮเวอร์ */}
          {fabHover && (
            <div
              className="absolute right-full mr-3 px-4 py-2 rounded-full bg-[#E4ECF6] text-[#4A5568] text-sm font-normal whitespace-nowrap shadow-md"
              style={{ fontFamily: "var(--font-ibm-plex-sans-thai), sans-serif" }}
            >
              Personnel, guide Information
            </div>
          )}
          <button
            onClick={() => setShowDetailModal(true)}
            onMouseEnter={() => setFabHover(true)}
            onMouseLeave={() => setFabHover(false)}
            className="flex w-16 h-16 items-center justify-center gap-[10px] rounded-full transition-all z-40 bg-[#1A73E8] text-white shadow-lg hover:shadow-[0_0_20px_rgba(26,115,232,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2"
          >
            {/* ไอคอน Personnel / Guide ตาม Figma */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={32}
              height={32}
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden
            >
              <path
                d="M29.3346 10.666C29.3346 5.33268 26.668 2.66602 21.3346 2.66602H10.668C5.33464 2.66602 2.66797 5.33268 2.66797 10.666V27.9993C2.66797 28.7327 3.26797 29.3327 4.0013 29.3327H21.3346C26.668 29.3327 29.3346 26.666 29.3346 21.3327V15.9993"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 12.666H22.6667"
                stroke="white"
                strokeWidth={1.5}
                strokeMiterlimit={10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.33203 12.666H15.9987"
                stroke="white"
                strokeWidth={1.5}
                strokeMiterlimit={10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.33203 19.334H18.6654"
                stroke="white"
                strokeWidth={1.5}
                strokeMiterlimit={10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        )}
      </div>

      {/* Modals */}
      <WarningModal
        isOpen={showWarningModal}
        variant={warningVariant}
        onConfirm={processCheckIn}
        onCancel={() => {
          // ปิด modal อื่นๆ ทั้งหมดเมื่อปิด WarningModal
          setShowCheckInModal(false);
          setShowNoShowModal(false);
          pendingCheckInBookingIdRef.current = null;
          pendingNoShowRef.current = null;
          pendingRescheduleRef.current = null;
          pendingRefundRef.current = null;
          pendingBulkCheckInIdsRef.current = null;
          // ถ้ามี pending check-in แล้วผู้ใช้ยกเลิกที่ Warning ให้ revert
          revertPendingCheckInIfAny();
          setShowWarningModal(false);
        }}
      />

      <LoadingModal isOpen={showLoading} />

      <SuccessModal
        isOpen={showSuccess}
        variant={successVariant}
        onClose={() => setShowSuccess(false)}
      />

      {selectedBooking && (() => {
        const bookingForModal = bookingStates.find((b) => b.id === selectedBooking.id) ?? selectedBooking;
        return (
          <NoShowModal
            isOpen={showNoShowModal}
            onClose={() => {
              // ปิด modal อื่นๆ ทั้งหมดเมื่อปิด NoShowModal
              setShowWarningModal(false);
              setShowCheckInModal(false);
              setShowNoShowModal(false);
              setSelectedBooking(null);
              // ถ้ามีข้อมูล Check-in ที่มาจาก CheckInModal และยังไม่ยืนยัน ให้ revert กลับเป็นค่าก่อนหน้า
              if (pendingNoShowFromCheckInRef.current !== null && pendingOriginalBookingRef.current) {
                const { bookingId, checkIn, noShow, status } = pendingOriginalBookingRef.current;
                setBookingStates((prev) =>
                  prev.map((b) =>
                    b.id === bookingId ? { ...b, checkIn, noShow, status } : b
                  )
                );
              }
              pendingNoShowFromCheckInRef.current = null;
              pendingOriginalBookingRef.current = null;
              setNoShowModalFromAddCondition(false);
            }}
            checkInPax={bookingForModal.checkIn}
            bookingQuantity={bookingForModal.pax}
            noShowPax={pendingNoShowFromCheckInRef.current ?? bookingForModal.noShow}
            bookingNo={bookingForModal.bookingNo}
            travelDate={tripData.travelDate}
            tripRound={tripData.tripRound}
            customerName={bookingForModal.customerName}
            pricePerPax={1500}
            hideLaterButton={noShowModalFromAddCondition}
            onConfirm={(condition, data) => {
              const payload = data && typeof data === "object" ? data as { noShowPax?: number; condition?: string; [k: string]: unknown } : {};
              const noShowPax = Number(payload.noShowPax ?? 0);
              const cond = payload.condition;

              if (condition === "noShowCount" && "noShowPax" in payload) {
                if (cond === "fullCharge") {
                  pendingNoShowRef.current = {
                    bookingId: selectedBooking.id,
                    noShowPax,
                    originalPax: bookingForModal.pax,
                  };
                  setShowNoShowModal(false);
                  setSelectedBooking(null);
                  setWarningVariant("fullCharge");
                  setShowWarningModal(true);
                }
              }
              if (condition === "reschedule") {
                pendingRescheduleRef.current = {
                  bookingId: selectedBooking.id,
                  payload: {
                    bookingNo: bookingForModal.bookingNo,
                    rescheduleData: payload,
                  },
                };
                setShowNoShowModal(false);
                setSelectedBooking(null);
                setWarningVariant("reschedule");
                setShowWarningModal(true);
              }
              if (condition === "refund") {
                pendingRefundRef.current = {
                  bookingId: selectedBooking.id,
                  payload,
                };
                setShowNoShowModal(false);
                setSelectedBooking(null);
                setWarningVariant("refund");
                setShowWarningModal(true);
              }
            }}
            onLater={(noShowPaxFromModal: number) => {
              const checkIn = bookingForModal.pax - noShowPaxFromModal;
              setBookingStates((prev) =>
                prev.map((b) =>
                  b.id === selectedBooking.id
                    ? { ...b, noShow: noShowPaxFromModal, checkIn, status: "waitingReason" as const }
                    : b
                )
              );
              // ยืนยันให้สถานะ Waiting Reason คงอยู่ ไม่ต้อง revert กลับ
              pendingNoShowFromCheckInRef.current = null;
              pendingOriginalBookingRef.current = null;
              setShowNoShowModal(false);
              setSelectedBooking(null);
              setNoShowModalFromAddCondition(false);
            }}
          />
        );
      })()}

      {selectedBooking && (() => {
        const bookingForModal = bookingStates.find((b) => b.id === selectedBooking.id) ?? selectedBooking;
        return (
          <CheckInModal
            isOpen={showCheckInModal}
            onClose={() => {
              // ปิดเฉพาะ CheckInModal เอง ไม่ยุ่งกับ NoShow / Warning
              setShowCheckInModal(false);
            }}
            bookingNo={bookingForModal.bookingNo}
            travelDate={tripData.travelDate}
            tripRound={tripData.tripRound}
            customerName={bookingForModal.customerName}
            totalPax={bookingForModal.pax}
            initialCheckIn={bookingForModal.checkIn}
            onConfirm={(checkInCount) => {
              const noShowCount = bookingForModal.pax - checkInCount;
              // เก็บค่าก่อนหน้าไว้เพื่อ revert ได้ถ้าผู้ใช้กดยกเลิกที่หน้า Condition
              pendingOriginalBookingRef.current = {
                bookingId: bookingForModal.id,
                checkIn: bookingForModal.checkIn,
                noShow: bookingForModal.noShow,
                status: bookingForModal.status,
              };
              // อัปเดตจำนวน Check-in / No Show ชั่วคราว
              setBookingStates((prev) =>
                prev.map((b) =>
                  b.id === selectedBooking.id
                    ? { ...b, checkIn: checkInCount, noShow: noShowCount }
                    : b
                )
              );
              // ปิด CheckInModal ก่อน
              setShowCheckInModal(false);
              setSelectedBooking((prev) =>
                prev ? { ...prev, checkIn: checkInCount, noShow: noShowCount } : null
              );
              // ใช้ setTimeout เพื่อให้ CheckInModal ปิดก่อน แล้วค่อยเปิด modal ถัดไป
              setTimeout(() => {
                if (noShowCount > 0) {
                  // เก็บ noShowCount ที่คำนวณได้ไว้เพื่อส่งไปยัง NoShowModal
                  pendingNoShowFromCheckInRef.current = noShowCount;
                  setShowNoShowModal(true);
                } else {
                  pendingCheckInBookingIdRef.current = selectedBooking.id;
                  setWarningVariant("checkIn");
                  setShowWarningModal(true);
                }
              }, 100);
            }}
          />
        );
      })()}

      {/* Detail Modal - ทับไอคอน ปิดได้เฉพาะกดกากบาท */}
      {showDetailModal && (
        <>
          {/* Modal Content - ชิดมุมขวาล่างให้ทับไอคอน FAB */}
          <div
            className="fixed right-8 bottom-8 w-[320px] max-h-[85vh] overflow-y-auto bg-slate-800 rounded-2xl px-5 py-4 flex flex-col items-start gap-4 shadow-2xl z-50 animate-slide-in-right"
          >
            {/* Close Button - กากบาทในวงกลมสีขาว */}
            <div className="self-stretch flex justify-end items-center">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-7 h-7 flex items-center justify-center bg-white text-slate-800 hover:bg-slate-100 rounded-full transition-colors shadow"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Vehicle Detail */}
            <div className="w-full flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-white shrink-0" />
                <span className="text-white text-sm font-medium leading-5">
                  Vehicle Detail
                </span>
              </div>
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-start gap-2 w-full">
                  <span className="text-white text-sm font-medium w-24 shrink-0">Vehicle</span>
                  <span className="text-white text-sm font-normal">{tripDetail.vehicleName}</span>
                </div>
                <div className="flex items-start gap-2 w-full">
                  <span className="text-white text-sm font-medium w-24 shrink-0">Registration</span>
                  <span className="text-white text-sm font-normal">{tripDetail.registration}</span>
                </div>
              </div>
            </div>

            {/* Separator - เส้นประ */}
            <div className="self-stretch h-0 border-t border-dashed border-gray-500"></div>

            {/* Personnel Detail */}
            <div className="w-full flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-white shrink-0" />
                <span className="text-white text-sm font-medium leading-5">
                  Personnel Detail
                </span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {tripDetail.personnel.map((p: TripPerson, i: number) => (
                  <div key={`personnel-${i}`} className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Position</span>
                      <span className="text-white text-sm font-normal">{p.position}</span>
                    </div>
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Name</span>
                      <span className="text-white text-sm font-normal">{p.name}</span>
                    </div>
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Phone Number</span>
                      <a href={`tel:${p.phone.replace(/-/g, "")}`} className="text-white text-sm font-normal hover:underline">{p.phone}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator - เส้นประ */}
            <div className="self-stretch h-0 border-t border-dashed border-gray-500"></div>

            {/* Guide Detail */}
            <div className="w-full flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-white shrink-0" />
                <span className="text-white text-sm font-medium leading-5">
                  Guide Detail
                </span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {tripDetail.guides.map((g: TripPerson, i: number) => (
                  <div key={`guide-${i}`} className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Position</span>
                      <span className="text-white text-sm font-normal">{g.position}</span>
                    </div>
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Name</span>
                      <span className="text-white text-sm font-normal">{g.name}</span>
                    </div>
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-white text-sm font-medium w-24 shrink-0">Phone Number</span>
                      <a href={`tel:${g.phone.replace(/-/g, "")}`} className="text-white text-sm font-normal hover:underline">{g.phone}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
