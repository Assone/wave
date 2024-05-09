import { createCookieSessionStorage } from "@remix-run/cloudflare";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: ["wave"],
      sameSite: true,
      httpOnly: true,
    },
  });
