export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_COOKIE_NAME = "theme";
export const THEME_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 31536000,
};

export function serializeCookieOptions(options: typeof THEME_COOKIE_OPTIONS): string {
  const parts: string[] = [];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}

export function getThemeCookie(request: Request): ThemePreference | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const themeCookie = cookies.find((c) => c.startsWith(`${THEME_COOKIE_NAME}=`));
  if (!themeCookie) return null;

  const value = themeCookie.split("=")[1];
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return null;
}

export function resolveTheme(
  preference: ThemePreference | null,
  _request?: Request,
): ResolvedTheme {
  if (!preference || preference === "system") {
    return "light";
  }
  return preference;
}

export function getThemeFromCookie(): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${THEME_COOKIE_NAME}=`));
  if (!cookie) return null;
  const value = cookie.split("=")[1];
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return null;
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
