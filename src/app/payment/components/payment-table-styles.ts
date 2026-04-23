/** สีธนาคารในคอลัมน์ Book Bank — ใช้ร่วมกับ Advance / Expense / Balance */
export const PAYMENT_BANK_COLOR: Record<string, string> = {
  "ธ.กสิกรไทย": "#2BB673",
  "ธ.ไทยพาณิชย์": "#553C9A",
};

export const formatPaymentMoney = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
