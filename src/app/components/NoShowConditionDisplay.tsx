"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { NoShowConditionDetail } from "@/app/lib/no-show-condition";

function Row({
  label,
  children,
  compact,
}: {
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="self-stretch inline-flex justify-start items-start gap-1 mt-1">
        <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] shrink-0">{label}</div>
        <div className="text-[#2A2A2A] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-[0.01em] min-w-0">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
      <span className="text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight shrink-0">
        {label}
      </span>
      <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight flex-1 min-w-0">
        {children}
      </span>
    </div>
  );
}

export default function NoShowConditionDisplay({
  detail,
  compact = false,
  tripCodeForSplitLink,
  viewBasePath = "/check-in/excursion/view",
}: {
  detail: NoShowConditionDetail | null | undefined;
  compact?: boolean;
  /** ใช้ลิงก์ Booking Split ไปหน้า View Trip เดิม + query เปิดลิ้นชัก */
  tripCodeForSplitLink?: string;
  /** เช่น `/check-in/transport/view` เมื่อเปิดจาก flow Transport */
  viewBasePath?: string;
}) {
  if (!detail) {
    if (compact) {
      return (
        <div className="text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px]">-</div>
      );
    }
    return <span className="text-[#2a2a2a] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight">-</span>;
  }

  if (detail.kind === "fullRefund") {
    return <Row compact={compact} label="Condition :">No-Show Full refund</Row>;
  }

  if (detail.kind === "fullCharge") {
    return <Row compact={compact} label="Condition :">No-show Full Charge</Row>;
  }

  if (detail.kind === "rescheduleFull") {
    return (
      <div className={compact ? "flex flex-col gap-0.5" : "flex flex-col gap-3 w-full"}>
        <Row compact={compact} label="Condition Reschedule (Original Date) :">
          {detail.originalDate}
        </Row>
        <Row compact={compact} label="Additional :">
          {detail.additional || "-"}
        </Row>
        <Row compact={compact} label="Remark :">{detail.remark || "-"}</Row>
      </div>
    );
  }

  if (detail.kind === "rescheduleSplitOriginal") {
    const base = viewBasePath.replace(/\/$/, "");
    const href =
      tripCodeForSplitLink && detail.splitBookingNo
        ? `${base}/${encodeURIComponent(tripCodeForSplitLink)}?openBooking=${encodeURIComponent(detail.splitBookingNo)}`
        : null;
    return (
      <div className={compact ? "flex flex-col gap-0.5" : "flex flex-col gap-3 w-full"}>
        <div className={compact ? "self-stretch inline-flex justify-start items-start gap-1 mt-1" : "self-stretch inline-flex justify-start items-start gap-2 flex-wrap"}>
          <div
            className={
              compact
                ? "text-[#848484] text-xs font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] shrink-0"
                : "text-[#2a2a2a] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight shrink-0"
            }
          >
            Condition :
          </div>
          <div className="min-w-0">
            {href ? (
              <Link href={href} className="text-[#265ed6] underline font-medium text-sm sm:text-base">
                {detail.splitBookingNo}
              </Link>
            ) : (
              <span className="text-[#265ed6] underline">{detail.splitBookingNo}</span>
            )}
          </div>
        </div>
        <Row compact={compact} label="Pax (Split) :">{detail.splitPax}</Row>
        <Row compact={compact} label="Additional :">{detail.additional || "-"}</Row>
        <Row compact={compact} label="Remark :">{detail.remark || "-"}</Row>
      </div>
    );
  }

  if (detail.kind === "refund") {
    return (
      <div className={compact ? "flex flex-col gap-0.5" : "flex flex-col gap-3 w-full"}>
        <Row compact={compact} label="Condition :">{detail.condition}</Row>
        <Row compact={compact} label="Pax :">{detail.pax}</Row>
        <Row compact={compact} label="Reason :">{detail.reason || "-"}</Row>
        {detail.details !== undefined && (
          <Row compact={compact} label="Details :">{detail.details || "-"}</Row>
        )}
        <Row compact={compact} label="Refund Amount :">
          ฿ {detail.refundAmount.toLocaleString()}
        </Row>
        <Row compact={compact} label="Remark :">{detail.remark || "-"}</Row>
      </div>
    );
  }

  if (detail.kind === "legacyPlain") {
    return <Row compact={compact} label="Condition :">{detail.text}</Row>;
  }

  return null;
}
