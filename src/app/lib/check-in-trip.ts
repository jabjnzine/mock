/**
 * ข้อมูลทริปและ Vehicle/Personnel/Guide ร่วมกันระหว่าง List กับ View
 * - Registration แบบ กข-234 (ตัวอักษรไทย-ตัวเลขไม่เกิน 4 หลัก)
 * - List แสดง Registration = "Vehicle : Registration", Personnel = "Name, Telephone"
 */

const THAI_CONSONANTS = "กขคงจฉชซฎฏฐฑฒณดตถทธนบปผพฟภมยรลวศษสหฬอฮ";

export function getRegistrationPlate(tripCode: string): string {
  const seed = (tripCode || "EC25Z1PW").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const c1 = THAI_CONSONANTS[(seed + 1) % THAI_CONSONANTS.length];
  const c2 = THAI_CONSONANTS[(seed + 7) % THAI_CONSONANTS.length];
  const digits = 1 + (seed % 4);
  const num = (seed * 13 + 97) % Math.pow(10, digits);
  return `${c1}${c2}-${String(num).padStart(digits, "0").slice(-digits)}`;
}

export interface TripPerson {
  position: string;
  name: string;
  phone: string;
}

export interface TripDetail {
  vehicleName: string;
  registration: string;
  personnel: TripPerson[];
  guides: TripPerson[];
}

const EXCURSION_TRIP_OVERRIDES: Partial<Record<string, TripDetail>> = {
  EC25Z1PW: {
    vehicleName: "Speed Catamaran 2 engines (30)",
    registration: "โลมาใจดี2",
    personnel: [
      { position: "Captain", name: "Capt. Trunk", phone: "096-6502747" },
      { position: "Crew", name: "สมศักดิ์ เรือเร็ว", phone: "082-5551234" },
    ],
    guides: [
      { position: "Guide", name: "G. Peter", phone: "094-4313995" },
      { position: "Guide", name: "G. Mary", phone: "092-7788990" },
    ],
  },
  EC2581C4: {
    vehicleName: "Bus (39)",
    registration: "กด-123",
    personnel: [
      { position: "Driver", name: "Somchai", phone: "089-456-7821" },
    ],
    guides: [
      { position: "Guide", name: "G. Peter", phone: "094-4313995" },
      { position: "Guide", name: "G. Mary", phone: "092-7788990" },
    ],
  },
  EC255D2C: {
    vehicleName: "Guide Only (20)",
    registration: "Guide",
    personnel: [],
    guides: [
      { position: "Guide", name: "G. Peter", phone: "094-4313995" },
      { position: "Guide", name: "G. Mary", phone: "092-7788990" },
    ],
  },
};

export function getTripDetail(tripCode: string, isTransport: boolean): TripDetail {
  const code = tripCode?.trim() || "";
  const override = !isTransport && code ? EXCURSION_TRIP_OVERRIDES[code] : undefined;
  if (override) return override;

  const registration = getRegistrationPlate(tripCode);
  if (isTransport) {
    return {
      vehicleName: "Van (20)",
      registration,
      personnel: [
        { position: "Driver", name: "สมชาย ใจดี", phone: "089-1234567" },
        { position: "Driver (Backup)", name: "สมหญิง รถรับ", phone: "081-9876543" },
      ],
      guides: [
        { position: "Guide", name: "G. Peter", phone: "094-4313995" },
      ],
    };
  }
  return {
    vehicleName: "Speed Catamaran 2 engines",
    registration,
    personnel: [
      { position: "Captain", name: "Capt. Trunk", phone: "096-6502747" },
      { position: "Crew", name: "สมศักดิ์ เรือเร็ว", phone: "082-5551234" },
    ],
    guides: [
      { position: "Guide", name: "G. Peter", phone: "094-4313995" },
      { position: "Guide", name: "G. Mary", phone: "092-7788990" },
    ],
  };
}

/** รูปแบบ Registration สำหรับแสดงในตาราง List: Vehicle : Registration */
export function getRegistrationDisplay(tripCode: string, isTransport: boolean): string {
  const d = getTripDetail(tripCode, isTransport);
  return `${d.vehicleName} : ${d.registration}`;
}

/** รูปแบบ Personnel สำหรับแสดงในตาราง List: เฉพาะคนแรก Name, Telephone หรือ "-" ถ้าไม่มี */
export function getPersonnelDisplay(tripCode: string, isTransport: boolean): string {
  const d = getTripDetail(tripCode, isTransport);
  const first = d.personnel[0];
  return first ? `${first.name}, ${first.phone}` : "-";
}
