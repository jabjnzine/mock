"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid, CurrencyDollarIcon as CurrencyDollarIconSolid } from "@heroicons/react/24/solid";

const rowBase =
  "h-12 p-3 rounded-md inline-flex justify-start items-center gap-2 overflow-hidden w-full text-left transition-colors";
const rowDefault = "text-white hover:bg-white/5";
const rowActive = "bg-blue-700 text-white";
const sectionPill =
  "px-4 py-1 rounded-[100px] text-blue-400 text-sm font-medium font-['IBM_Plex_Sans_Thai'] leading-5 tracking-tight";
const subRowBase = "pl-6 pr-2 py-3 rounded-md inline-flex justify-start items-center gap-2 w-full text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-tight transition-colors";
const divider = "w-56 h-0 outline outline-[0.5px] outline-offset-[-0.25px] outline-white/30";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`bg-zinc-800 text-white flex flex-col transition-[width] duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ minHeight: "100vh" }}
    >
      <div className="flex-1 flex flex-col justify-between items-start self-stretch py-8">
        <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-8 px-4">
          {/* Header: Logo + Collapse */}
          <div className="self-stretch inline-flex justify-between items-center gap-4 flex-wrap">
            {!isCollapsed && (
              <div className="w-20 h-10 flex items-center">
                <span className="text-lg font-bold uppercase tracking-tight text-white">
                  TOUR SYSTEM
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="size-8 flex items-center justify-center bg-white rounded-lg shadow-[0px_8px_16px_0px_rgba(0,0,0,0.04)] text-zinc-800 hover:bg-zinc-100 transition-colors shrink-0"
              aria-label="ย่อ/ขยายเมนู"
            >
              <ChevronLeftIcon
                className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Menu */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">

            {/* Check In — expandable */}
            <div className="self-stretch flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCheckInOpen(!checkInOpen)}
                className={`${rowBase} px-2 ${
                  pathname.startsWith("/check-in")
                    ? "text-blue-600 hover:bg-white/5"
                    : rowDefault
                }`}
              >
                {pathname.startsWith("/check-in") ? (
                  <CheckCircleIconSolid className="size-6 flex-shrink-0" />
                ) : (
                  <CheckCircleIcon className="size-6 flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <>
                    <span className="text-base font-medium leading-6 tracking-tight flex-1 text-left">
                      Check In
                    </span>
                    <ChevronDownIcon
                      className={`size-5 flex-shrink-0 transition-transform ${
                        checkInOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {checkInOpen && !isCollapsed && (
                <>
                  <div className={sectionPill}>Excursion</div>
                  <div className="w-56 flex flex-col gap-0">
                    <Link
                      href="/check-in/excursion"
                      className={`${subRowBase} ${
                        isActive("/check-in/excursion") ? rowActive : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 flex-shrink-0 rounded-full ${
                          isActive("/check-in/excursion") ? "bg-white" : "bg-gray-100"
                        }`}
                      />
                      <span>Check In</span>
                    </Link>
                    <Link
                      href="/check-in/excursion/list"
                      className={`${subRowBase} ${
                        isActive("/check-in/excursion/list")
                          ? rowActive
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 flex-shrink-0 rounded-full ${
                          isActive("/check-in/excursion/list") ? "bg-white" : "bg-gray-100"
                        }`}
                      />
                      <span>Check In List</span>
                    </Link>
                  </div>
                  <div className={sectionPill}>Transport</div>
                  <div className="w-56 flex flex-col gap-0">
                    <Link
                      href="/check-in/transport"
                      className={`${subRowBase} ${
                        isActive("/check-in/transport") && !pathname.includes("/list")
                          ? rowActive
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 flex-shrink-0 rounded-full ${
                          isActive("/check-in/transport") && !pathname.includes("/list")
                            ? "bg-white"
                            : "bg-gray-100"
                        }`}
                      />
                      <span>Check In</span>
                    </Link>
                    <Link
                      href="/check-in/transport/list"
                      className={`${subRowBase} ${
                        isActive("/check-in/transport/list") ? rowActive : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 flex-shrink-0 rounded-full ${
                          isActive("/check-in/transport/list") ? "bg-white" : "bg-gray-100"
                        }`}
                      />
                      <span>Check In List</span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            {!isCollapsed && <div className={divider} />}

            {/* Payment — expandable (แยกออกจาก Check In) */}
            <div className="self-stretch flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPaymentOpen(!paymentOpen)}
                className={`${rowBase} px-2 ${
                  pathname.startsWith("/payment")
                    ? "text-blue-600 hover:bg-white/5"
                    : rowDefault
                }`}
              >
                {pathname.startsWith("/payment") ? (
                  <CurrencyDollarIconSolid className="size-6 flex-shrink-0" />
                ) : (
                  <CurrencyDollarIcon className="size-6 flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <>
                    <span className="text-base font-medium leading-6 tracking-tight flex-1 text-left">
                      Payment
                    </span>
                    <ChevronDownIcon
                      className={`size-5 flex-shrink-0 transition-transform ${
                        paymentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {paymentOpen && !isCollapsed && (
                <div className="w-56 flex flex-col gap-0">
                  {[
                    { href: "/payment/advance",  label: "Advance"  },
                    { href: "/payment/expenses", label: "Expenses" },
                    { href: "/payment/balance",  label: "Balance"  },
                    { href: "/payment/report",   label: "Report"   },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`${subRowBase} ${
                        pathname.startsWith(href) ? rowActive : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 flex-shrink-0 rounded-full ${
                          pathname.startsWith(href) ? "bg-white" : "bg-gray-100"
                        }`}
                      />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer — วงกลม N */}
        <div className="self-stretch p-4 border-t border-white/10 flex justify-center">
          <div className="size-10 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-semibold">
            N
          </div>
        </div>
      </div>
    </aside>
  );
}
