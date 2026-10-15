import type { MemberSlot } from "@/services/member-badminton-api";

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEMBER_PREFIX = "KVK-MEM-2026";
export const money = (amount: number) => `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const minutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
export const slotTime = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(mins).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};
export const slotLabel = (slot: MemberSlot) => `${slotTime(slot.startTime)} - ${slotTime(slot.endTime)}`;
export function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function sriLankaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map(key => parts.find(part => part.type === key)?.value).join("-");
}
export function initialWeeks(start: string, months: unknown) {
  const count = Number(months);
  if (!isDate(start) || !Number.isInteger(count) || count < 1 || count > 120) return "4";
  const date = new Date(`${start}T00:00:00Z`);
  const end = new Date(date);
  end.setUTCMonth(end.getUTCMonth() + count);
  return String(Math.ceil((end.getTime() - date.getTime()) / (7 * 86400000)));
}
export function consecutiveSlots(ids: string[], slots: MemberSlot[]) {
  const selected = slots.filter(slot => ids.includes(slot.slotId));
  return selected.length === ids.length && selected.every((slot, index) => index === 0 || minutes(selected[index - 1].endTime) === minutes(slot.startTime));
}
export function validateSchedule(date: string, minDate: string, weeks: string, days: string[], ids: string[], slots: MemberSlot[]) {
  if (!isDate(date) || date < minDate) return "Choose a valid start date on or after the first booking date.";
  if (!Number.isSafeInteger(Number(weeks)) || Number(weeks) < 1) return "Enter a valid number of weeks.";
  if (!days.length) return "Choose at least one day of the week.";
  if (!ids.length) return "Choose at least one time slot.";
  if (!consecutiveSlots(ids, slots)) return "Choose consecutive time slots without gaps.";
  return "";
}
