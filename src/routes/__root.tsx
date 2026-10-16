import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import { MoonBlock } from "#/components/moon-block.tsx";
import { getVisitorToday } from "#/lib/dates.ts";
import { getThemeCookie, resolveTheme } from "#/lib/theme.ts";
import { ThemeToggle } from "#/components/theme-toggle.tsx";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import type { ThemePreference, ResolvedTheme } from "#/lib/theme.ts";

interface MyRouterContext {
  queryClient: QueryClient;
}

interface ThemeData {
  preference: ThemePreference;
  resolved: ResolvedTheme;
}

async function getThemeData(): Promise<ThemeData> {
  // Only run on server during SSR
  if (import.meta.env.SSR) {
    const { getStartContext } = await import("@tanstack/start-storage-context");
    const request = getStartContext().request;
    const preference = getThemeCookie(request) ?? "system";
    const resolved = resolveTheme(preference, request);
    return { preference, resolved };
  }
  // Client fallback - will be corrected by boot script
  return { preference: "system", resolved: "light" };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const theme = await getThemeData();
    return {
      ssrToday: getVisitorToday(),
      theme,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Moon Phases",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/images/moon.50.png",
      },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: RootError,
  staleTime: Infinity,
  shellComponent: RootDocument,
});

function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] p-6 text-center md:p-8">
      <h1 className="display-title mb-4 text-3xl">Page not found</h1>
      <p className="mb-6">The page you are looking for doesn't exist or may have moved.</p>
      <Link to="/" className="nav-link">
        Back to today's moon
      </Link>
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  return (
    <div className="mx-auto max-w-[720px] p-6 text-center md:p-8">
      <h1 className="display-title mb-4 text-3xl">Something went wrong</h1>
      <p className="mb-6">{message}</p>
      <Link to="/" className="nav-link">
        Back to today's moon
      </Link>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { ssrToday, theme } = Route.useLoaderData();

  return (
    <html lang="en" data-mode={theme.resolved}>
      <head>
        <HeadContent />
        {theme.preference === "system" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const m = window.matchMedia('(prefers-color-scheme: dark)');
                  const apply = (e) => {
                    document.documentElement.dataset.mode = e.matches ? 'dark' : 'light';
                    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
                  };
                  apply(m);
                  m.addEventListener('change', apply);
                })();
              `,
            }}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                requestAnimationFrame(() => {
                  document.documentElement.classList.add('theme-transitioning');
                  requestAnimationFrame(() => {
                    document.documentElement.classList.remove('theme-transitioning');
                  });
                });
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="page-wrap flex min-h-screen flex-col py-6">
          <header className="mb-8 flex items-center justify-between">
            <Link to="/" className="display-title text-2xl no-underline">
              Moon Phases
            </Link>
            <nav className="flex items-center gap-6 text-lg">
              <ThemeToggle initialTheme={theme} />
              <Link to="/" activeProps={{ className: "is-active" }} className="nav-link">
                Today
              </Link>
              <Link
                to="/calendar"
                activeOptions={{ exact: false }}
                activeProps={{ className: "is-active" }}
                className="nav-link"
              >
                Calendar
              </Link>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="site-footer mt-10 pt-6">
            <MoonBlock ssrToday={ssrToday} />
          </footer>
        </div>

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
