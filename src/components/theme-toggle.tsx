import { useState } from "react";
import { setTheme } from "#/server/functions/theme.ts";
import { cn } from "#/lib/utils.ts";
import { getSystemTheme } from "#/lib/theme.ts";
import type { ThemePreference, ResolvedTheme } from "#/lib/theme.ts";

interface Props {
  initialTheme: { preference: ThemePreference; resolved: ResolvedTheme };
}

export function ThemeToggle({ initialTheme }: Props) {
  const [preference, setPreference] = useState<ThemePreference>(initialTheme.preference);

  const handleChange = async (next: ThemePreference) => {
    const resolved = next === "system" ? getSystemTheme() : next;
    setPreference(next);

    document.documentElement.dataset.mode = resolved;
    document.documentElement.style.colorScheme = resolved;

    try {
      await setTheme({ data: next });
    } catch {
      setPreference(initialTheme.preference);
      document.documentElement.dataset.mode = initialTheme.resolved;
      document.documentElement.style.colorScheme = initialTheme.resolved;
    }
  };

  return (
    <div className="flex gap-1.5 p-1 bg-muted rounded-lg" role="group" aria-label="Theme">
      {(["light", "dark", "system"] as ThemePreference[]).map((t) => {
        const isActive = preference === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => handleChange(t)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
            aria-pressed={isActive}
            aria-label={t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
          >
            {t === "light" && <span aria-hidden>☀</span>}
            {t === "dark" && <span aria-hidden>☾</span>}
            {t === "system" && <span aria-hidden>⚙</span>}
            <span className="sr-only">{t}</span>
          </button>
        );
      })}
    </div>
  );
}
