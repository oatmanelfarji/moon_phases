import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import { MoonBlock } from "#/components/moon-block.tsx";
import { getVisitorToday } from "#/lib/dates.ts";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: () => ({ ssrToday: getVisitorToday() }),
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
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { ssrToday } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="page-wrap flex min-h-screen flex-col py-6">
          <header className="mb-8 flex items-center justify-between">
            <Link to="/" className="display-title text-2xl no-underline">
              Moon Phases
            </Link>
            <nav className="flex gap-6 text-lg">
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
