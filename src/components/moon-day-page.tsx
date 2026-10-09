import { Link } from "@tanstack/react-router";

import { Attribution } from "#/components/attribution.tsx";
import { MoonImage } from "#/components/moon-image.tsx";
import { PHASE_DESCRIPTIONS } from "#/config/moon.ts";
import { addDays, dateToYmd, formatDayTitle } from "#/lib/dates.ts";
import { getMoonSnapshot } from "#/lib/moonCalc.ts";

interface MoonDayPageProps {
  /** UTC-noon calendar date for the page. */
  date: Date;
}

const PHASE_DATA_ORDER = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"] as const;

export function MoonDayPage({ date }: MoonDayPageProps) {
  const snapshot = getMoonSnapshot(date);
  const description = PHASE_DESCRIPTIONS[snapshot.phaseKey] ?? "";
  const prevDate = addDays(date, -1);
  const nextDate = addDays(date, 1);

  return (
    <article className="moon_page island-shell rise-in mx-auto max-w-[720px] p-6 md:p-8">
      <h1 className="display-title mb-6 text-3xl md:text-4xl">
        {formatDayTitle(date)}: {snapshot.phaseName}
      </h1>

      <header className="mb-4 flex items-center justify-between">
        <Link to="/day/$date" params={{ date: dateToYmd(prevDate) }} className="moon-prev nav-link">
          « Previous
        </Link>
        <Link to="/day/$date" params={{ date: dateToYmd(nextDate) }} className="moon-next nav-link">
          Next »
        </Link>
      </header>

      <section className="clear-both">
        <MoonImage
          src={snapshot.imageSrc}
          phaseName={snapshot.phaseName}
          className="mb-4 mr-4 h-[200px] w-[200px] float-left md:mb-4 md:mr-6"
        />

        <div
          className="moon-description prose max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <ul className="moon-phase-data mt-4 list-disc space-y-1 pl-6">
          <li>
            <strong>{snapshot.illumination}%</strong> illumination
          </li>
          {PHASE_DATA_ORDER.map((phase) => (
            <li key={phase}>
              <strong>{snapshot.daysUntil[phase]}</strong> days until next {phase}
            </li>
          ))}
        </ul>

        <Attribution />
      </section>
    </article>
  );
}
