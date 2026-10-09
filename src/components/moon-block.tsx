import { Link } from "@tanstack/react-router";

import { MoonImage } from "#/components/moon-image.tsx";
import { ymdToDate } from "#/lib/dates.ts";
import { getMoonSnapshot } from "#/lib/moonCalc.ts";
import { useVisitorToday } from "#/lib/use-visitor-today.ts";

interface MoonBlockProps {
  /** Server-resolved "today" (YYYY-MM-DD); re-resolved in the visitor's timezone after hydration. */
  ssrToday: string;
}

export function MoonBlock({ ssrToday }: MoonBlockProps) {
  const today = useVisitorToday(ssrToday);
  const [y, m, d] = today.split("-").map(Number);
  const snapshot = getMoonSnapshot(ymdToDate(y, m, d));

  return (
    <div className="moon_phase_block island-shell max-w-[320px] p-4">
      <MoonImage src={snapshot.imageSrc} phaseName={snapshot.phaseName} className="mb-3 w-24" />

      <h2 className="display-title mb-2 text-xl">{snapshot.phaseName}</h2>

      <ul className="moon-phase-summary list-disc space-y-1 pl-5">
        <li>{Math.floor(snapshot.daysUntil["Full Moon"])} days until the next full moon</li>
        <li>{Math.floor(snapshot.daysUntil["New Moon"])} days until the next new moon</li>
        <li>{Math.round(snapshot.illumination)}% illuminated</li>
        <li>
          <Link to="/" className="moon-more-link float-right">
            See more »
          </Link>
        </li>
      </ul>
      <div className="clear-both" />
    </div>
  );
}
