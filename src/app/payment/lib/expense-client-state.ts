import {
  type Trip,
  type TripStatus,
  type ExpenseSections,
} from "./payment-data";

function cloneExpenseDraft(sections: ExpenseSections): ExpenseSections {
  return JSON.parse(JSON.stringify(sections)) as ExpenseSections;
}

const statusByTripCode = new Map<string, TripStatus>();
const expenseDraftByTripCode = new Map<string, ExpenseSections>();
const expenseTotalByTripCode = new Map<string, number>();
const slipPreviewSrcByTripCode = new Map<string, string>();

export function expenseSetTripExpenseDraft(tripCode: string, sections: ExpenseSections) {
  expenseDraftByTripCode.set(tripCode, cloneExpenseDraft(sections));
}

export function expenseGetTripExpenseDraft(tripCode: string): ExpenseSections | undefined {
  const draft = expenseDraftByTripCode.get(tripCode);
  return draft ? cloneExpenseDraft(draft) : undefined;
}

export function expenseSetTripExpenseTotal(tripCode: string, total: number) {
  expenseTotalByTripCode.set(tripCode, total);
}

export function expenseResolveActTotal(trip: Trip, fallbackTotal: number): number {
  return expenseTotalByTripCode.get(trip.tripCode) ?? fallbackTotal;
}

export function expenseGetClientTripStatus(tripCode: string): TripStatus | undefined {
  return statusByTripCode.get(tripCode);
}

export function expenseSetTripSlipPreviewSrc(tripCode: string, src: string) {
  slipPreviewSrcByTripCode.set(tripCode, src);
}

export function expenseGetTripSlipPreviewSrc(tripCode: string): string | undefined {
  return slipPreviewSrcByTripCode.get(tripCode);
}

export function expenseMarkTripStatus(tripCode: string, status: TripStatus) {
  statusByTripCode.set(tripCode, status);
}

const SESSION_OPEN_COMPLETED_TAB = "expense_open_completed_tab";

export function expenseRequestCompletedTab() {
  try {
    sessionStorage.setItem(SESSION_OPEN_COMPLETED_TAB, "1");
  } catch {
    /* ignore */
  }
}

export function expenseReadInitialCompletedTab(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_OPEN_COMPLETED_TAB) === "1";
  } catch {
    return false;
  }
}

export function expenseClearCompletedTabFlag() {
  try {
    sessionStorage.removeItem(SESSION_OPEN_COMPLETED_TAB);
  } catch {
    /* ignore */
  }
}

export function expenseApplyClientTripStatus<T extends { tripCode: string; status: TripStatus }>(trips: T[]): T[] {
  return trips.map(trip => {
    const status = statusByTripCode.get(trip.tripCode);
    return status ? { ...trip, status } : { ...trip };
  });
}
