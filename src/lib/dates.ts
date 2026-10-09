/**
 * Calendar-date helpers.
 *
 * Convention: a "calendar date" (a day on the lunar calendar pages) is
 * represented as a Date anchored at UTC noon of that day. Anchoring at noon
 * (rather than midnight) keeps day boundaries stable across every timezone,
 * so SSR and client render the same phase for the same /day/$date URL.
 *
 * "Today" for the visitor is resolved in the visitor's timezone and then
 * converted to a UTC-noon date via `ymdToDate`.
 */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

/** Parse YYYY-MM-DD into a UTC-noon Date, or null if invalid. */
export function parseDayParam(value: string): Date | null {
  if (!DAY_RE.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1) return null;
  if (d > daysInMonth(y, m)) return null;
  return ymdToDate(y, m, d);
}

/** Parse YYYY-MM into the 1st of that month (UTC noon), or null. */
export function parseMonthParam(value: string): Date | null {
  if (!MONTH_RE.test(value)) return null;
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  return ymdToDate(y, m, 1);
}

/** Build a UTC-noon Date from year/month/day parts. */
export function ymdToDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Format a UTC-noon Date as YYYY-MM-DD. */
export function dateToYmd(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a UTC-noon Date as YYYY-MM. */
export function dateToYm(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

/** Today's calendar date in the visitor's timezone, as YYYY-MM-DD. */
export function getVisitorToday(now: Date = new Date()): string {
  const y = now.getFullYear().toString().padStart(4, "0");
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Add months keeping noon anchoring; clamps the day (Jan 31 +1mo -> Mar 3 in JS, so clamp). */
export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0-based
  const d = date.getUTCDate();
  const targetY = y + Math.floor((m + months) / 12);
  const targetM = (((m + months) % 12) + 12) % 12;
  const clampedD = Math.min(d, daysInMonth(targetY, targetM + 1));
  return ymdToDate(targetY, targetM + 1, clampedD);
}

export function daysInMonth(year: number, month1Based: number): number {
  return new Date(Date.UTC(year, month1Based, 0)).getUTCDate();
}

export interface MonthDay {
  /** Day of month, 1-based. */
  day: number;
  /** Day of week, 0 = Sunday. */
  weekday: number;
  date: Date;
}

/** All days of the month containing `date`, in order. */
export function monthDays(date: Date): MonthDay[] {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const count = daysInMonth(y, m);
  const days: MonthDay[] = [];
  for (let d = 1; d <= count; d++) {
    const dayDate = ymdToDate(y, m, d);
    days.push({ day: d, weekday: dayDate.getUTCDay(), date: dayDate });
  }
  return days;
}

/** Leading empty cells before day 1 (0 = month starts on Sunday). */
export function leadingPad(date: Date): number {
  return ymdToDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1).getUTCDay();
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_NAME_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
});

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const WEEKDAY_NAME_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

/** "October 2026" */
export function formatMonthTitle(date: Date): string {
  return MONTH_FORMAT.format(date);
}

/** "October" (for prev/next month link labels) */
export function formatMonthName(date: Date): string {
  return MONTH_NAME_FORMAT.format(date);
}

/** "October 9th, 2026" — day-page <title>. */
export function formatDayTitle(date: Date): string {
  return withOrdinalDay(DAY_FORMAT.format(date));
}

/** "Friday, October 9th, 2026" — calendar cell tooltip / full date. */
export function formatFullDate(date: Date): string {
  return withOrdinalDay(WEEKDAY_FORMAT.format(date));
}

/** "Friday" */
export function formatWeekdayName(date: Date): string {
  return WEEKDAY_NAME_FORMAT.format(date);
}

/** Append ordinal suffix to the first day number found ("October 9th, 2026"). */
function withOrdinalDay(formatted: string): string {
  return formatted.replace(
    /\b(\d{1,2})\b(?=,)/,
    (match) => `${match}${ordinalSuffix(Number(match))}`,
  );
}

export function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
