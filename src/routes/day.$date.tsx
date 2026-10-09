import { createFileRoute, redirect } from "@tanstack/react-router";

import { MoonDayPage } from "#/components/moon-day-page.tsx";
import { formatDayTitle, parseDayParam } from "#/lib/dates.ts";
import { getMoonPhaseName } from "#/lib/moonCalc.ts";

export const Route = createFileRoute("/day/$date")({
  beforeLoad: ({ params }) => {
    const date = parseDayParam(params.date);
    if (!date) {
      throw redirect({ to: "/" });
    }
    return { date };
  },
  head: ({ params }) => {
    // beforeLoad already validated; parse again for the title.
    const date = parseDayParam(params.date);
    if (!date) {
      return { meta: [{ title: "Moon Phases" }] };
    }
    return {
      meta: [
        {
          title: `Moon Phases — ${formatDayTitle(date)}: ${getMoonPhaseName(date)}`,
        },
      ],
    };
  },
  component: DayPage,
});

function DayPage() {
  const { date } = Route.useRouteContext();
  return <MoonDayPage date={date} />;
}
