/**
 * โครงสร้าง No-show Condition ตามประเภท (Refund / Reschedule แบบเต็มหรือแยกส่วน / Full refund / Full charge)
 */
export type NoShowConditionDetail =
  | { kind: "fullRefund" }
  | { kind: "fullCharge" }
  | {
      kind: "rescheduleFull";
      /** เช่น "17/12/2025 : 07 : 30" */
      originalDate: string;
      additional: string;
      remark: string;
    }
  | {
      kind: "rescheduleSplitOriginal";
      splitBookingNo: string;
      splitPax: number;
      additional: string;
      remark: string;
    }
  | {
      kind: "refund";
      condition: string;
      pax: number;
      reason: string;
      refundAmount: number;
      remark: string;
    }
  /** ข้อความจากระบบเก่าที่ยังไม่ได้แปลงเป็นโครงสร้าง */
  | { kind: "legacyPlain"; text: string };

export function refundReasonKeyToLabel(key: string, otherReason?: string): string {
  switch (key) {
    case "health_issue":
      return "Health Issue / Medical Condition";
    case "bad_weather":
      return "Bad Weather";
    case "personal_emergency":
      return "Personal Emergency";
    case "person_not_allowed":
      return "Person not allowed";
    case "other_reason": {
      const detail = otherReason?.trim() ?? "";
      return detail ? `Other (${detail})` : "Other (Details)";
    }
    default:
      return key || "-";
  }
}

/** แปลงสตริงเดิม (mock / ข้อมูลเก่า) เป็นโครงสร้างใหม่ */
export function detailFromLegacyString(
  legacy: string | undefined,
  fallbackPax: number
): NoShowConditionDetail | undefined {
  if (!legacy?.trim()) return undefined;
  if (legacy === "No-show Full Charge" || legacy.toLowerCase().includes("full charge"))
    return { kind: "fullCharge" };
  if (legacy === "No-show Full refund" || /full\s*refund/i.test(legacy)) return { kind: "fullRefund" };
  if (legacy === "Refund" || /^refund$/i.test(legacy))
    return {
      kind: "refund",
      condition: "Refund",
      pax: fallbackPax,
      reason: "-",
      refundAmount: 0,
      remark: "-",
    };
  if (/^reschedule/i.test(legacy)) {
    return {
      kind: "rescheduleFull",
      originalDate: legacy.replace(/^Reschedule to\s*/i, "").trim() || "-",
      additional: "-",
      remark: "-",
    };
  }
  return { kind: "legacyPlain", text: legacy };
}

export function resolveNoShowConditionDetail(booking: {
  noShowConditionDetail?: NoShowConditionDetail;
  noShowCondition?: string;
  noShow?: number;
}): NoShowConditionDetail | undefined {
  if (booking.noShowConditionDetail) return booking.noShowConditionDetail;
  return detailFromLegacyString(booking.noShowCondition, booking.noShow ?? 0);
}

/** ข้อความสั้นสำหรับรายการ Booking (รายละเอียดเต็มดูใน View Booking) */
export function getNoShowConditionSummaryLabel(
  detail: NoShowConditionDetail | undefined | null
): string {
  if (!detail) return "-";
  switch (detail.kind) {
    case "fullRefund":
      return "No-Show Full refund";
    case "fullCharge":
      return "No-show Full Charge";
    case "rescheduleFull":
      return "Reschedule";
    case "rescheduleSplitOriginal":
      return `Reschedule (Booking : ${detail.splitBookingNo})`;
    case "refund":
      return "Refund";
    case "legacyPlain":
      return detail.text.trim() || "-";
    default:
      return "-";
  }
}
