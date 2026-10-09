import { createFileRoute, redirect } from "@tanstack/react-router";

import { MoonCalendar } from "#/components/moon-calendar.tsx";
import { formatMonthTitle, parseMonthParam } from "#/lib/dates.ts";

export const Route = createFileRoute("/calendar/$month")({
  beforeLoad: ({ params }) => {
    const month = parseMonthParam(params.month);
    if (!month) {
      throw redirect({ to: "/calendar" });
    }
    return { month };
  },
  head: ({ params }) => {
    const month = parseMonthParam(params.month);
    if (!month) {
      return { meta: [{ title: "Moon Phases" }] };
    }
    return {
      meta: [{ title: `Moon Phases — ${formatMonthTitle(month)}` }],
    };
  },
  component: CalendarMonthPage,
});

function CalendarMonthPage() {
  const { month } = Route.useRouteContext();
  return <MoonCalendar date={month} />;
}
