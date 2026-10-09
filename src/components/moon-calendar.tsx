import { Link } from "@tanstack/react-router";

import { Attribution } from "#/components/attribution.tsx";
import { MoonImage } from "#/components/moon-image.tsx";
import {
  addMonths,
  dateToYmd,
  dateToYm,
  formatFullDate,
  formatMonthName,
  formatMonthTitle,
  leadingPad,
  monthDays,
} from "#/lib/dates.ts";
import { getMoonSnapshot } from "#/lib/moonCalc.ts";

interface MoonCalendarProps {
  /** UTC-noon date within the month to display (day-of-month is ignored). */
  date: Date;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function MoonCalendar({ date }: MoonCalendarProps) {
  const prevDate = addMonths(date, -1);
  const nextDate = addMonths(date, 1);
  const days = monthDays(date);
  const pad = leadingPad(date);

  return (
    <article className="moon-calendar island-shell rise-in mx-auto max-w-[960px] p-4 md:p-6">
      <h1 className="display-title mb-4 text-3xl md:text-4xl">{formatMonthTitle(date)}</h1>

      <header className="mb-4 flex items-center justify-between">
        <Link
          to="/calendar/$month"
          params={{ month: dateToYm(prevDate) }}
          className="moon-prev nav-link"
        >
          « {formatMonthName(prevDate)}
        </Link>
        <Link
          to="/calendar/$month"
          params={{ month: dateToYm(nextDate) }}
          className="moon-next nav-link"
        >
          {formatMonthName(nextDate)} »
        </Link>
      </header>

      <section id="calendar">
        {/* Weekday header — desktop only, hidden at the 960px breakpoint. */}
        <header className="mb-1 hidden grid-cols-7 text-center text-lg max-[960px]:hidden">
          {WEEKDAYS.map((day) => (
            <div key={day} className={day.toLowerCase()}>
              {day}
            </div>
          ))}
        </header>

        {/* Grid on desktop, vertical list at ≤960px. */}
        <div className="grid grid-cols-7 gap-px max-[960px]:flex max-[960px]:flex-col max-[960px]:gap-[1px]">
          {/* Leading pad cells for months that don't start on Sunday. */}
          {Array.from({ length: pad }, (_, i) => (
            <div
              key={`pad-${i}`}
              className="moon-calendar-day placeholder aspect-[14.1/12] max-[960px]:hidden"
              aria-hidden="true"
            />
          ))}

          {days.map((day) => {
            const snapshot = getMoonSnapshot(day.date);
            const ymd = dateToYmd(day.date);
            return (
              <Link
                key={ymd}
                to="/day/$date"
                params={{ date: ymd }}
                title={formatFullDate(day.date)}
                className={[
                  "moon-calendar-day moon-day",
                  WEEKDAYS[day.weekday].toLowerCase(),
                  // Desktop: dark cell, day number top-right, full-width image, phase name below.
                  "relative block bg-black text-center text-white",
                  "max-[960px]:flex max-[960px]:w-full max-[960px]:items-center max-[960px]:text-left",
                ].join(" ")}
              >
                <span className="day absolute top-0 right-1 m-[3px_5px_0_0] max-[960px]:hidden">
                  {day.day}
                </span>

                <MoonImage
                  src={snapshot.imageSrc}
                  phaseName={snapshot.phaseName}
                  className="w-full max-[960px]:w-1/5"
                />

                <p className="mb-2 mt-1 text-center max-[960px]:float-left max-[960px]:mb-0 max-[960px]:ml-3 max-[960px]:text-left">
                  <span className="phase-name block text-[0.7em] max-[960px]:pt-5 max-[960px]:text-[1.1em]">
                    {snapshot.phaseName}
                  </span>
                  <span className="full-date hidden text-[0.8em] max-[960px]:block">
                    {formatFullDate(day.date)}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>

        <Attribution />
      </section>
    </article>
  );
}
