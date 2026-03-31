import {
  type Trip,
  type TripStatus,
  type AdvanceSections,
  type ExtraAdvanceItem,
  calcAdvTotal,
  calcExtraAdvTotal,
} from "./payment-data";

function cloneAdvanceDraft(
  sections: AdvanceSections,
  extraItems: ExtraAdvanceItem[],
): { sections: AdvanceSections; extraItems: ExtraAdvanceItem[] } {
  return {
    sections: JSON.parse(JSON.stringify(sections)) as AdvanceSections,
    extraItems: JSON.parse(JSON.stringify(extraItems)) as ExtraAdvanceItem[],
  };
}

/** สถานะทริปที่ override จาก mock — อยู่ใน memory เท่านั้น รีเฟรชหน้าจะหาย (กลับข้อมูล seed) */
const statusByTripCode = new Map<string, TripStatus>();

/** รายละเอียด Advance ที่บันทึกจากหน้ารายละเอียด — ให้กลับมา View ได้ตรงกับที่แก้ */
const advanceDraftByTripCode = new Map<string, { sections: AdvanceSections; extraItems: ExtraAdvanceItem[] }>();

export function advanceSetTripAdvanceDraft(
  tripCode: string,
  sections: AdvanceSections,
  extraItems: ExtraAdvanceItem[],
) {
  advanceDraftByTripCode.set(tripCode, cloneAdvanceDraft(sections, extraItems));
}

export function advanceGetTripAdvanceDraft(
  tripCode: string,
): { sections: AdvanceSections; extraItems: ExtraAdvanceItem[] } | undefined {
  const d = advanceDraftByTripCode.get(tripCode);
  return d ? cloneAdvanceDraft(d.sections, d.extraItems) : undefined;
}

/** อ่านสถานะที่ override (เช่น Completed หลัง Approve) — undefined = ใช้ค่าจาก trip seed */
export function advanceGetClientTripStatus(tripCode: string): TripStatus | undefined {
  return statusByTripCode.get(tripCode);
}

/** URL รูปสลิปหลัง Confirm (mock session) — รีเฟรชหน้าจะหาย */
const slipPreviewSrcByTripCode = new Map<string, string>();

export function advanceSetTripSlipPreviewSrc(tripCode: string, src: string) {
  slipPreviewSrcByTripCode.set(tripCode, src);
}

export function advanceGetTripSlipPreviewSrc(tripCode: string): string | undefined {
  return slipPreviewSrcByTripCode.get(tripCode);
}

/** ยอด Advance / Extra ที่บันทึกจากหน้ารายละเอียด — ใช้บนตารางรายการให้ตรงกับที่แก้ใน session */
const advanceTotalsByTripCode = new Map<string, { mainAdv: number; extraAdv: number }>();

export function advanceSetTripAdvanceTotals(tripCode: string, mainAdv: number, extraAdv: number) {
  advanceTotalsByTripCode.set(tripCode, { mainAdv, extraAdv });
}

export function advanceResolveMainAdvTotal(trip: Trip): number {
  const s = advanceTotalsByTripCode.get(trip.tripCode);
  return s !== undefined ? s.mainAdv : calcAdvTotal(trip);
}

export function advanceResolveExtraAdvTotal(trip: Trip): number {
  const s = advanceTotalsByTripCode.get(trip.tripCode);
  return s !== undefined ? s.extraAdv : calcExtraAdvTotal(trip);
}

const SESSION_OPEN_COMPLETED_TAB = "advance_open_completed_tab";

export function advanceMarkTripStatus(tripCode: string, status: TripStatus) {
  statusByTripCode.set(tripCode, status);
}

/** เรียกก่อนไปหน้ารายการหลัง Approve — อ่านแค่ครั้งเดียวตอนเปิดหน้า (รีเฟรชจะลบผ่าน beforeunload) */
export function advanceRequestCompletedTab() {
  try {
    sessionStorage.setItem(SESSION_OPEN_COMPLETED_TAB, "1");
  } catch {
    /* ignore */
  }
}

export function advanceReadInitialCompletedTab(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_OPEN_COMPLETED_TAB) === "1";
  } catch {
    return false;
  }
}

export function advanceClearCompletedTabFlag() {
  try {
    sessionStorage.removeItem(SESSION_OPEN_COMPLETED_TAB);
  } catch {
    /* ignore */
  }
}

export function advanceApplyClientTripStatus<T extends { tripCode: string; status: TripStatus }>(trips: T[]): T[] {
  return trips.map(t => {
    const s = statusByTripCode.get(t.tripCode);
    return s ? { ...t, status: s } : { ...t };
  });
}
