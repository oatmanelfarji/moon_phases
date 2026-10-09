import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { MoonCalendar } from "#/components/moon-calendar.tsx";
import { formatMonthTitle, getVisitorToday, parseDayParam, ymdToDate } from "#/lib/dates.ts";

export const Route = createFileRoute("/calendar/")({
  // SSR resolves "this month" in the server's timezone; the component
  // re-resolves in the visitor's timezone after hydration (no mismatch).
  loader: () => ({ ssrToday: getVisitorToday() }),
  head: ({ loaderData }) => {
    const date = (loaderData && parseDayParam(loaderData.ssrToday)) || ymdToDate(1970, 1, 1);
    return {
      meta: [{ title: `Moon Phases — ${formatMonthTitle(date)}` }],
    };
  },
  component: CalendarIndexPage,
});

function CalendarIndexPage() {
  const { ssrToday } = Route.useLoaderData();
  const [month, setMonth] = useState(() => monthFromYmd(ssrToday));

  useEffect(() => {
    setMonth(monthFromYmd(getVisitorToday()));
  }, []);

  return <MoonCalendar date={month} />;
}

function monthFromYmd(ymd: string): Date {
  const [y, m] = ymd.split("-").map(Number);
  return ymdToDate(y, m, 1);
}
