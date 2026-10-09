import { SHOW_ATTRIBUTION } from "#/config/moon.ts";

export function Attribution() {
  if (!SHOW_ATTRIBUTION) return null;

  return (
    <p className="attribution mt-4 text-sm italic">
      <a
        href="https://svs.gsfc.nasa.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="attribution"
      >
        Images courtesy of NASA&apos;s Scientific Visualization Studio
      </a>
    </p>
  );
}
