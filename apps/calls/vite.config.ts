import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { getLoadContext } from "./load-context";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({
      getLoadContext: getLoadContext as () => Promise<AppLoadContext>,
    }),
    remix(),
    tsconfigPaths(),
  ],
});
