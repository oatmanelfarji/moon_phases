import { describe, expect, it } from "vite-plus/test";

import {
  BASE_FULL_MOON_MS,
  getDaysUntilNextMoonType,
  getImageSrc,
  getMoonPhaseName,
  getPercentOfIllumination,
  getPhaseId,
  getPositionInCycle,
} from "./moonCalc.ts";

import {
  addDays,
  addMonths,
  dateToYmd,
  daysInMonth,
  formatDayTitle,
  formatMonthTitle,
  leadingPad,
  monthDays,
  ordinalSuffix,
  parseDayParam,
  parseMonthParam,
} from "./dates.ts";

describe("moonCalc", () => {
  it("base epoch is a full moon at 100% illumination", () => {
    const base = new Date(BASE_FULL_MOON_MS);
    expect(getPositionInCycle(base)).toBeCloseTo(0, 10);
    expect(getMoonPhaseName(base)).toBe("Full Moon");
    expect(getPercentOfIllumination(base)).toBeCloseTo(100, 6);
  });

  it("half a lunation later is a new moon at ~0% illumination", () => {
    const newMoon = new Date(BASE_FULL_MOON_MS + 0.5 * 29.53058867 * 86400 * 1000);
    expect(getPositionInCycle(newMoon)).toBeCloseTo(0.5, 6);
    expect(getMoonPhaseName(newMoon)).toBe("New Moon");
    expect(getPercentOfIllumination(newMoon)).toBeCloseTo(0, 4);
  });

  it("a quarter lunation later is first quarter at ~50%", () => {
    const firstQ = new Date(BASE_FULL_MOON_MS + 0.75 * 29.53058867 * 86400 * 1000);
    expect(getMoonPhaseName(firstQ)).toBe("First Quarter");
    expect(getPercentOfIllumination(firstQ)).toBeCloseTo(50, 3);
  });

  it("three quarters is last quarter at ~50%", () => {
    const lastQ = new Date(BASE_FULL_MOON_MS + 0.25 * 29.53058867 * 86400 * 1000);
    expect(getMoonPhaseName(lastQ)).toBe("Last Quarter");
    expect(getPercentOfIllumination(lastQ)).toBeCloseTo(50, 3);
  });

  it("wraps negative cycle positions into [0, 1)", () => {
    const before = new Date(BASE_FULL_MOON_MS - 86400 * 1000);
    const position = getPositionInCycle(before);
    expect(position).toBeGreaterThan(0.9);
    expect(position).toBeLessThanOrEqual(1);
  });

  it("maps Drupal threshold boundaries to the expected phase ids", () => {
    expect(getPhaseId(0)).toBe(4); // exactly full
    expect(getPhaseId(0.026)).toBe(4);
    expect(getPhaseId(0.027)).toBe(5);
    expect(getPhaseId(0.234)).toBe(5);
    expect(getPhaseId(0.235)).toBe(6);
    expect(getPhaseId(0.295)).toBe(6);
    expect(getPhaseId(0.3)).toBe(7); // gap -> waning crescent
    expect(getPhaseId(0.474)).toBe(0);
    expect(getPhaseId(0.53)).toBe(0);
    expect(getPhaseId(0.54)).toBe(1);
    expect(getPhaseId(0.724)).toBe(1);
    expect(getPhaseId(0.725)).toBe(2);
    expect(getPhaseId(0.776)).toBe(2);
    expect(getPhaseId(0.777)).toBe(3);
    expect(getPhaseId(0.974)).toBe(3);
    expect(getPhaseId(0.975)).toBe(4);
  });

  it("days until next full moon at full moon is one full period (2dp)", () => {
    const base = new Date(BASE_FULL_MOON_MS);
    expect(getDaysUntilNextMoonType(base, "Full Moon")).toBe(29.53);
  });

  it("days until next new moon at full moon is half a period (1dp)", () => {
    const base = new Date(BASE_FULL_MOON_MS);
    expect(getDaysUntilNextMoonType(base, "New Moon")).toBe(14.8);
  });

  it("days until next full moon halfway through the cycle is half a period", () => {
    const mid = new Date(BASE_FULL_MOON_MS + 0.5 * 29.53058867 * 86400 * 1000);
    expect(getDaysUntilNextMoonType(mid, "Full Moon")).toBe(14.77);
  });

  it("maps positions to image files with 100 wrapping to 00", () => {
    expect(getImageSrc(new Date(BASE_FULL_MOON_MS))).toBe("/images/moon.00.png");
    const almostFull = new Date(BASE_FULL_MOON_MS + 0.999 * 29.53058867 * 86400 * 1000);
    // round(99.9) = 100 -> wraps to 00
    expect(getImageSrc(almostFull)).toBe("/images/moon.00.png");
    const newMoon = new Date(BASE_FULL_MOON_MS + 0.5 * 29.53058867 * 86400 * 1000);
    expect(getImageSrc(newMoon)).toBe("/images/moon.50.png");
  });

  it("throws on unknown phase type", () => {
    const base = new Date(BASE_FULL_MOON_MS);
    // @ts-expect-error — invalid type must throw at runtime
    expect(() => getDaysUntilNextMoonType(base, "Blue Moon")).toThrow();
  });
});

describe("dates", () => {
  it("parses valid day params at UTC noon", () => {
    const d = parseDayParam("2026-10-09");
    expect(d).not.toBeNull();
    expect(dateToYmd(d!)).toBe("2026-10-09");
    expect(d!.getUTCHours()).toBe(12);
  });

  it("rejects invalid day params", () => {
    expect(parseDayParam("2026-13-01")).toBeNull();
    expect(parseDayParam("2026-02-30")).toBeNull();
    expect(parseDayParam("2026-10-9")).toBeNull();
    expect(parseDayParam("not-a-date")).toBeNull();
  });

  it("parses month params to the 1st of the month", () => {
    const m = parseMonthParam("2026-10");
    expect(m).not.toBeNull();
    expect(dateToYmd(m!)).toBe("2026-10-01");
    expect(parseMonthParam("2026-13")).toBeNull();
    expect(parseMonthParam("202610")).toBeNull();
  });

  it("adds days across month boundaries", () => {
    expect(dateToYmd(addDays(ymdHelper(2026, 10, 31), 1))).toBe("2026-11-01");
    expect(dateToYmd(addDays(ymdHelper(2026, 1, 1), -1))).toBe("2025-12-31");
  });

  it("adds months and clamps the day", () => {
    expect(dateToYmd(addMonths(ymdHelper(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(dateToYmd(addMonths(ymdHelper(2026, 12, 15), 1))).toBe("2027-01-15");
    expect(dateToYmd(addMonths(ymdHelper(2026, 1, 15), -1))).toBe("2025-12-15");
  });

  it("knows days in month including leap years", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 10)).toBe(31);
  });

  it("builds a month grid with correct weekdays and padding", () => {
    // October 2026 starts on a Thursday (weekday 4)
    const oct = parseMonthParam("2026-10")!;
    expect(leadingPad(oct)).toBe(4);
    const days = monthDays(oct);
    expect(days).toHaveLength(31);
    expect(days[0]).toMatchObject({ day: 1, weekday: 4 });
    expect(days[30]).toMatchObject({ day: 31 });
  });

  it("formats titles with ordinal days", () => {
    expect(formatDayTitle(ymdHelper(2026, 10, 9))).toBe("October 9th, 2026");
    expect(formatDayTitle(ymdHelper(2026, 10, 1))).toBe("October 1st, 2026");
    expect(formatDayTitle(ymdHelper(2026, 3, 23))).toBe("March 23rd, 2026");
    expect(formatMonthTitle(ymdHelper(2026, 10, 15))).toBe("October 2026");
  });

  it("computes ordinal suffixes", () => {
    expect(ordinalSuffix(1)).toBe("st");
    expect(ordinalSuffix(2)).toBe("nd");
    expect(ordinalSuffix(3)).toBe("rd");
    expect(ordinalSuffix(4)).toBe("th");
    expect(ordinalSuffix(11)).toBe("th");
    expect(ordinalSuffix(12)).toBe("th");
    expect(ordinalSuffix(13)).toBe("th");
    expect(ordinalSuffix(21)).toBe("st");
    expect(ordinalSuffix(22)).toBe("nd");
    expect(ordinalSuffix(23)).toBe("rd");
  });
});

function ymdHelper(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 12));
}
