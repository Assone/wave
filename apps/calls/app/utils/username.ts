import { getSession } from "@/session";
import { isString } from "./is";

export const setUsername = async (request: Request, username: string) => {
  const session = await getSession(request.headers.get("Cookie"));

  session.set("username", username);
  session.set("userId", crypto.randomUUID());

  return session;
};

export const getUsername = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("username");

  if (isString(username)) return username;

  return null;
};

export const getUserId = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (isString(userId)) return userId;

  return null;
};
