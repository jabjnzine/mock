// ─── TYPES ────────────────────────────────────────────────────────────────────
export type TripStatus = "Pending" | "Approved" | "Completed";
export type TripType   = "Join In" | "Private";
export type CostType   = "All" | "Person" | "Fix";
export type PaymentType = "Cash" | "Credit";

export interface Trip {
  id: number;
  tripCode: string;
  tripType: TripType;
  program: string;
  tripRound: string;
  date: string;
  option: string;
  guide: string;
  guide2: string;
  bankName: string;
  bankNo: string;
  paxAdv: number;
  checkedIn: number;
  noShow: number;
  status: TripStatus;
  vehicle: string;
}

export interface AdvanceItem {
  id: string;
  name: string;
  costType: CostType;
  costUnit: number;
  pax: number;
  advCost: number;
  actPax: number;
  actCost: number;
  checked: boolean;
}

export interface ExpenseItem {
  id: string;
  name: string;
  payment: PaymentType;
  supplier: string;
  costType: CostType;
  costUnit: number;
  actPax: number;
  actCost: number;
  checked: boolean;
}

export type SectionKey = "guide" | "vehicle" | "other" | "allowance" | "extra";
export type AdvanceSections = Record<SectionKey, AdvanceItem[]>;
export type ExpenseSections = Record<SectionKey, ExpenseItem[]>;

export interface ExtraAdvanceItem {
  id: string;
  name: string;
  costType: CostType;
  costUnit: number;
  pax: number;
  advCost: number;
  actPax: number;
  actCost: number;
  checked: boolean;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
export const INIT_TRIPS: Trip[] = [
  { id:1, tripCode:"EC26HXDU", tripType:"Join In",  program:"Damnoen + Buffalo Cafe + Maeklong",    tripRound:"07:00", date:"05/03/2026", option:"With Tickets",    guide:"G. Jannie", guide2:"G. Jame",  bankName:"ธ.กสิกรไทย",   bankNo:"158-8-13693-7",  paxAdv:9,  checkedIn:9,  noShow:0, status:"Pending",   vehicle:"BUS (30)"                  },
  { id:2, tripCode:"EC26QGZI", tripType:"Private",  program:"Maeklong & Amphawa",                   tripRound:"09:00", date:"05/03/2026", option:"Without Tickets", guide:"G. Lita",   guide2:"-",        bankName:"ธ.กสิกรไทย",   bankNo:"015-8-20863-6",  paxAdv:8,  checkedIn:8,  noShow:0, status:"Approved",  vehicle:"Speed Catamaran 2 engines" },
  { id:3, tripCode:"EC26XF0V", tripType:"Join In",  program:"Grand Palace, Wat Pho Half Day Tour",  tripRound:"07:30", date:"06/03/2026", option:"With Tickets",    guide:"G. Sammy",  guide2:"G. Jame",  bankName:"ธ.ไทยพาณิชย์", bankNo:"736-2-889-33-7", paxAdv:36, checkedIn:36, noShow:0, status:"Completed", vehicle:"BUS (45)"                  },
  { id:4, tripCode:"EC26RXD0", tripType:"Private",  program:"Discover Kanchanaburi Tour",           tripRound:"06:30", date:"06/03/2026", option:"With Tickets",    guide:"G. Jame",   guide2:"-",        bankName:"ธ.กสิกรไทย",   bankNo:"002-2-69648-3",  paxAdv:8,  checkedIn:8,  noShow:0, status:"Pending",   vehicle:"VAN (12)"                  },
  { id:5, tripCode:"EC26GOSD", tripType:"Join In",  program:"Floating Market + Nakhorn Prathom",   tripRound:"07:00", date:"07/03/2026", option:"Without Tickets", guide:"G. Jannie", guide2:"-",        bankName:"ธ.กสิกรไทย",   bankNo:"161-2-66949-6",  paxAdv:10, checkedIn:10, noShow:0, status:"Pending",   vehicle:"BUS (30)"                  },
];

// ─── SECTION META ─────────────────────────────────────────────────────────────
export const SEC: Record<SectionKey, { label: string; icon: string; bg: string; color: string; border: string; accent: string }> = {
  guide:     { label:"Guide",      icon:"👤", bg:"#EEF2FF", color:"#3730A3", border:"#C7D2FE", accent:"#3730A3" },
  vehicle:   { label:"Vehicle",    icon:"🚌", bg:"#FFF7ED", color:"#C2410C", border:"#FED7AA", accent:"#EA580C" },
  other:     { label:"Other",      icon:"🏷", bg:"#ECFDF5", color:"#065F46", border:"#A7F3D0", accent:"#059669" },
  allowance: { label:"Allowance",  icon:"💼", bg:"#F5F3FF", color:"#5B21B6", border:"#DDD6FE", accent:"#7C3AED" },
  extra:     { label:"Extra Cost", icon:"⭐", bg:"#FDF2F8", color:"#9D174D", border:"#FBCFE8", accent:"#DB2777" },
};

export const STATUS_STYLE: Record<TripStatus, { bg: string; color: string }> = {
  Pending:   { bg:"#FEF9C3", color:"#854D0E" },
  Approved:  { bg:"#DBEAFE", color:"#1E40AF" },
  Completed: { bg:"#DCFCE7", color:"#14532D" },
};

// ─── INIT ADVANCE SECTIONS ────────────────────────────────────────────────────
export function initAdvSections(trip: Trip): AdvanceSections {
  const p = trip.paxAdv;
  const a = trip.checkedIn;
  return {
    guide:     [
      { id:"g1", name:"Guide freelancer (โกด์จ้างรายวัน) 1", costType:"All",    costUnit:2000, pax:p, advCost:2000,   actPax:a, actCost:2000,   checked:true  },
      { id:"g2", name:"Guide freelancer (โกด์จ้างรายวัน) 2", costType:"Fix",    costUnit:800,  pax:p, advCost:800,    actPax:a, actCost:800,    checked:false },
    ],
    vehicle:   [
      { id:"v1", name:"ค่าน้ำมัน",                           costType:"All",    costUnit:500,  pax:p, advCost:500,    actPax:a, actCost:500,    checked:true  },
    ],
    other:     [
      { id:"o1", name:"ค่าน้ำดื่ม",                          costType:"Person", costUnit:15,   pax:p, advCost:15*p,   actPax:a, actCost:15*a,   checked:true  },
      { id:"o2", name:"ค่าน้ำดื่ม (Guide)",                  costType:"Person", costUnit:20,   pax:p, advCost:20*p,   actPax:a, actCost:20*a,   checked:true  },
      { id:"o3", name:"ค่าเรือนำเที่ยว (เรืออัมพวา)",        costType:"Fix",    costUnit:600,  pax:p, advCost:600,    actPax:a, actCost:600,    checked:true  },
    ],
    allowance: [
      { id:"a1", name:"ค่าเบี้ยเลี้ยง Driver",               costType:"All",    costUnit:500,  pax:p, advCost:500,    actPax:a, actCost:500,    checked:true  },
    ],
    extra:     [
      { id:"e1", name:"ประกันการเดินทาง",                    costType:"Person", costUnit:30,   pax:p, advCost:30*p,   actPax:a, actCost:30*a,   checked:true  },
    ],
  };
}

// ─── INIT EXPENSE SECTIONS ────────────────────────────────────────────────────
export function initExpSections(trip: Trip): ExpenseSections {
  const a = trip.checkedIn;
  return {
    guide: [
      { id:"g1", name:"Guide freelancer (โกด์จ้างรายวัน) 1", payment:"Cash",   supplier:"-",   costType:"All",    costUnit:2000, actPax:a, actCost:2000,    checked:true  },
      { id:"g2", name:"Guide freelancer (โกด์จ้างรายวัน) 2", payment:"Credit", supplier:"-",   costType:"Person", costUnit:800,  actPax:a, actCost:800*a,   checked:false },
    ],
    vehicle: [
      { id:"v1", name:"ค่าน้ำมัน",                           payment:"Cash",   supplier:"-",   costType:"All",    costUnit:500,  actPax:a, actCost:500,     checked:true  },
      { id:"v2", name:"ATC — BUS : 45",                      payment:"Credit", supplier:"ATC", costType:"All",    costUnit:3200, actPax:a, actCost:3200,    checked:true  },
    ],
    other: [
      { id:"o1", name:"ค่าน้ำดื่ม",                          payment:"Cash",   supplier:"-",   costType:"Person", costUnit:15,   actPax:a, actCost:15*a,    checked:true  },
      { id:"o2", name:"ค่าน้ำดื่ม (Guide)",                  payment:"Cash",   supplier:"-",   costType:"Person", costUnit:20,   actPax:a, actCost:20*a,    checked:true  },
      { id:"o3", name:"ค่าเรือนำเที่ยว (เรืออัมพวา)",        payment:"Cash",   supplier:"-",   costType:"Fix",    costUnit:600,  actPax:a, actCost:600,     checked:true  },
      { id:"o4", name:"ค่าประกันภัย",                        payment:"Credit", supplier:"-",   costType:"Person", costUnit:40,   actPax:a, actCost:40*a,    checked:true  },
    ],
    allowance: [
      { id:"a1", name:"ค่าเบี้ยเลี้ยง Driver",               payment:"Cash",   supplier:"-",   costType:"All",    costUnit:500,  actPax:a, actCost:500,     checked:true  },
    ],
    extra: [
      { id:"e1", name:"ประกันการเดินทาง",                    payment:"Cash",   supplier:"-",   costType:"Person", costUnit:30,   actPax:a, actCost:30*a,    checked:true  },
    ],
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function calcAdvTotal(trip: Trip): number {
  const secs = initAdvSections(trip);
  const nonExtra = (["guide","vehicle","other","allowance"] as SectionKey[])
    .flatMap(k => secs[k]).filter(i => i.checked);
  return nonExtra.reduce((s, i) => s + i.advCost, 0);
}

export function calcExtraAdvTotal(trip: Trip): number {
  return initAdvSections(trip).extra.filter(i => i.checked).reduce((s, i) => s + i.advCost, 0);
}

export function calcActTotal(trip: Trip): number {
  return Object.values(initExpSections(trip)).flat().filter(i => i.checked).reduce((s, i) => s + i.actCost, 0);
}
