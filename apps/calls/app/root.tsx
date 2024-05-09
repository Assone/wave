import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  useRouteError,
} from "@remix-run/react";
import { Terminal } from "lucide-react";
import styles from "./assets/main.css?url";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Toaster } from "./components/ui/toaster";
import { isNull } from "./utils/is";
import { getUsername } from "./utils/username";
import { LazyMotion, domMax } from "framer-motion";
import DebugTools from "./components/DebugTools";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const username = await getUsername(request);

  if (isNull(username) && url.pathname !== "/set-username") {
    const redirectUrl = new URL(url);
    redirectUrl.pathname = "/set-username";
    redirectUrl.searchParams.set("redirect-url", request.url);

    throw redirect(redirectUrl.toString());
  }

  return {};
};

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <DebugTools />
      </body>
    </html>
  );
}

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;
  console.error(error);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full flex justify-center items-center">
        <div className="place-items-center">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle className="font-bold text-xl">
              Oh no! Something went wrong.
            </AlertTitle>
            <AlertDescription>
              <h1 className="font-bold">Message: {error.message}</h1>
              <pre>{error.stack}</pre>
            </AlertDescription>
          </Alert>
        </div>
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      <Outlet />
    </LazyMotion>
  );
}
