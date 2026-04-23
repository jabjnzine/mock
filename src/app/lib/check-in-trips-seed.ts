/**
 * ชุด Trip อ้างอิงเดียวกับ Check-in List (Excursion + Transport)
 * Payment / Advance ใช้ tripCode และข้อมูลพื้นฐานจากที่นี่
 */

export type CheckInTripSource = "excursion" | "transport";

export interface CheckInTripSeedRow {
  tripCode: string;
  source: CheckInTripSource;
  travelDate: string;
  /** รูปแบบเดียวกับ List เช่น "07 : 30" — normalize ตอน map ไป Payment */
  tripRound: string;
  tripType: "Join In" | "Private";
  program: string;
  pax: number;
  checkedIn: number;
  noShow: number;
  /** สถานะใน workflow Payment (ไม่ใช่แท็บ Check-in โดยตรง) */
  paymentStatus: "Pending" | "Approved" | "Completed";
}

export const CHECK_IN_TRIP_SEEDS: CheckInTripSeedRow[] = [
  {
    tripCode: "EC25Z1PW",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "07 : 30",
    tripType: "Join In",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    pax: 20,
    checkedIn: 7,
    noShow: 8,
    paymentStatus: "Pending",
  },
  {
    tripCode: "EC2581C4",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "07 : 30",
    tripType: "Join In",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    pax: 39,
    checkedIn: 38,
    noShow: 1,
    paymentStatus: "Approved",
  },
  {
    tripCode: "EC25DM35",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "08 : 00",
    tripType: "Join In",
    program: "Damnoen + Buffalo Cafe + Maeklong",
    pax: 35,
    checkedIn: 15,
    noShow: 5,
    paymentStatus: "Pending",
  },
  {
    tripCode: "EC255D2C",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "00 : 00",
    tripType: "Join In",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    pax: 20,
    checkedIn: 10,
    noShow: 0,
    paymentStatus: "Pending",
  },
  {
    tripCode: "EC25PV01",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "08 : 00",
    tripType: "Private",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    pax: 6,
    checkedIn: 0,
    noShow: 0,
    paymentStatus: "Pending",
  },
  {
    tripCode: "EC25PV02",
    source: "excursion",
    travelDate: "17/12/2025",
    tripRound: "08 : 30",
    tripType: "Private",
    program: "Bangkok: Grand Palace, Wat Pho, Chao Phraya River and Wat Arun Full Day Tour",
    pax: 8,
    checkedIn: 5,
    noShow: 0,
    paymentStatus: "Pending",
  },
  {
    tripCode: "EC25ABC1",
    source: "excursion",
    travelDate: "16/12/2025",
    tripRound: "08:00",
    tripType: "Join In",
    program: "Completed Trip Example",
    pax: 20,
    checkedIn: 20,
    noShow: 0,
    paymentStatus: "Completed",
  },
  {
    tripCode: "TF25Z1PW",
    source: "transport",
    travelDate: "17/12/2025",
    tripRound: "07 : 30",
    tripType: "Join In",
    program: "Phuket : Maya Bay, Phi Phi & Bamboo Islands with Lunch",
    pax: 20,
    checkedIn: 15,
    noShow: 0,
    paymentStatus: "Pending",
  },
];
