import { createFileRoute } from "@tanstack/react-router";

import { MoonDayPage } from "#/components/moon-day-page.tsx";
import { formatDayTitle, getVisitorToday, parseDayParam, ymdToDate } from "#/lib/dates.ts";
import { getMoonPhaseName } from "#/lib/moonCalc.ts";
import { useVisitorToday } from "#/lib/use-visitor-today.ts";

export const Route = createFileRoute("/")({
  // SSR resolves "today" in the server's timezone; the hook re-resolves in
  // the visitor's timezone after hydration (no mismatch — same initial value).
  loader: () => ({ ssrToday: getVisitorToday() }),
  head: ({ loaderData }) => {
    const date = (loaderData && parseDayParam(loaderData.ssrToday)) || ymdToDate(1970, 1, 1);
    return {
      meta: [{ title: `Moon Phases — ${formatDayTitle(date)}: ${getMoonPhaseName(date)}` }],
    };
  },
  component: TodayPage,
});

function TodayPage() {
  const { ssrToday } = Route.useLoaderData();
  const today = useVisitorToday(ssrToday);

  // Parse "YYYY-MM-DD" (visitor-local) into a UTC-noon calendar date.
  const [y, m, d] = today.split("-").map(Number);
  const date = ymdToDate(y, m, d);

  return <MoonDayPage date={date} />;
}
