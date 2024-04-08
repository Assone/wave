import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";
import autoImport from "unplugin-auto-import/vite";
import { defineConfig, loadEnv, type UserConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "HTTPS");
  const { HTTPS_KEY_PATH, HTTPS_CERT_PATH } = env;

  const config: UserConfig = {
    plugins: [react(), autoImport({ imports: ["react"], dts: true })],
    server: {
      https:
        HTTPS_KEY_PATH && HTTPS_CERT_PATH
          ? {
              key: readFileSync(HTTPS_KEY_PATH),
              cert: readFileSync(HTTPS_CERT_PATH),
            }
          : undefined,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // "/socket.io": {
        //   target: "ws://localhost:3000/socket.io",
        //   ws: true,
        //   rewrite: (path) => path.replace(/^\/socket.io/, ""),
        // },
      },
    },
  };

  return config;
});
