import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS, resolveTheme } from "#/lib/theme.ts";

export const setTheme = createServerFn({ method: "POST" })
  .validator(z.enum(["light", "dark", "system"]))
  .handler(async ({ data }) => {
    const resolved = resolveTheme(data);

    setCookie(THEME_COOKIE_NAME, data, THEME_COOKIE_OPTIONS);

    return { theme: data, resolved };
  });
