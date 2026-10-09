import { useEffect, useState } from "react";

import { getVisitorToday } from "./dates.ts";

/**
 * Visitor's local calendar date as YYYY-MM-DD.
 *
 * SSR renders with the server's date (`ssrToday`); after hydration the hook
 * re-resolves the visitor's timezone. Initial client state matches the server
 * markup, so there is no hydration mismatch — the value only flips in the
 * effect when the visitor's "today" differs from the server's.
 */
export function useVisitorToday(ssrToday: string): string {
  const [today, setToday] = useState(ssrToday);

  useEffect(() => {
    setToday(getVisitorToday());
  }, []);

  return today;
}
