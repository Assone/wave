import type { ChatRoom } from "@/models/ChatRoom";
import type { GetLoadContextFunction } from "@remix-run/cloudflare-pages";
import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env {
  CALLS_APP_ID: string;
  CALLS_APP_SECRET: string;
  rooms: DurableObjectNamespace<ChatRoom>;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}

export const getLoadContext: GetLoadContextFunction = ({ context }) => {
  return { ...context };
};
