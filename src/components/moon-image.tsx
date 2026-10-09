interface MoonImageProps {
  src: string;
  phaseName: string;
  className?: string;
}

export function MoonImage({ src, phaseName, className }: MoonImageProps) {
  return (
    <img
      src={src}
      alt={phaseName}
      title={phaseName}
      data-attribution="NASA's Scientific Visualization Studio"
      className={["moon", "h-auto rounded-full", className].filter(Boolean).join(" ")}
    />
  );
}
