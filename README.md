# Moon Phases

A lunar calendar web app built with TanStack Start — a recreation of the Drupal [Moon Phases](https://www.drupal.org/project/moon_phases) module. Shows the moon phase for any day, a month calendar of phases, and a compact "current phase" block.

## Routes

| Path               | Page                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `/`                | Today's moon phase (resolved in the visitor's timezone)                           |
| `/day/$date`       | Phase for a specific day (`YYYY-MM-DD`); invalid dates redirect to `/`            |
| `/calendar`        | Current month's phase calendar                                                    |
| `/calendar/$month` | Calendar for a specific month (`YYYY-MM`); invalid months redirect to `/calendar` |

Each calendar day links to its day page. Day pages include the phase image, an EarthSky.org description, illumination %, days until the next New/First Quarter/Full/Last Quarter moon, and previous/next day navigation. The footer block shows today's phase with a quick summary.

## Configuration

Phase descriptions and the NASA image attribution flag live in [`src/config/moon.ts`](src/config/moon.ts) — edit the HTML strings there and commit the change. `SHOW_ATTRIBUTION` toggles the "Images courtesy of NASA's Scientific Visualization Studio" credit.

Phase calculation is a direct port of the Drupal module's algorithm ([`src/lib/moonCalc.ts`](src/lib/moonCalc.ts)): a 29.53058867-day lunation measured from the 2008-12-12 16:37 UTC full moon, with the original module's phase thresholds. The 100 phase images (`public/images/moon.00.png`–`moon.99.png`) are from NASA's Scientific Visualization Studio.

## Development

```bash
vp test          # run unit tests (moonCalc + date helpers)
vp check         # format, lint, and type check
pnpm run generate-routes  # regenerate the route tree after adding routes
```

# Getting Started

To run this application:

```bash
vp install
vp dev
```

Configuration lives in `vite.config.ts`; scripts in `package.json` are run with `vp run <name>` (e.g. `pnpm run generate-routes`).

## Environment Variables

Copy the example env file and set your database connection string:

```bash
cp .env.example .env.local
```

`DATABASE_URL` is required by Drizzle (`drizzle.config.ts`) and the app's DB client (`src/db/index.ts`).

## Database (Drizzle + PostgreSQL)

```bash
pnpm run db:generate  # generate migrations from src/db/schema.ts
pnpm run db:migrate   # apply migrations
pnpm run db:push      # push schema directly to the DB
pnpm run db:studio    # open Drizzle Studio
```

# Building For Production

To build this application for production:

```bash
vp build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Replace the Tailwind import in `src/styles.css` with your own styles
2. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
3. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`

## Deploy with Nitro

This project uses Nitro as a generic server adapter, so it can run on any Node-compatible host.

```bash
vp build
node dist/server/index.mjs
```

The build output is a self-contained Node server. To deploy, push the `dist/` directory to your host (Render, Fly.io, your own VPS, etc.) and run the server command above.

For host-specific presets (Vercel, Netlify, Cloudflare, AWS Lambda, etc.) and tuning, see https://v3.nitro.build/deploy.

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My App" },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
});
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from "@tanstack/react-start";

const getServerTime = createServerFn({
  method: "GET",
}).handler(async () => {
  return new Date().toISOString();
});

// Use in a component
function MyComponent() {
  const [time, setTime] = useState("");

  useEffect(() => {
    getServerTime().then(setTime);
  }, []);

  return <div>Server time: {time}</div>;
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => json({ message: "Hello, World!" }),
    },
  },
});
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/people")({
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json();
  },
  component: PeopleComponent,
});

function PeopleComponent() {
  const data = Route.useLoaderData();
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  );
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
