import { isNull } from "@/utils/is";
import { getUsername } from "@/utils/username";
import {
  type ActionFunction,
  type DataFunctionArgs,
  type LoaderFunction,
} from "@remix-run/cloudflare";

const proxyFetch = async ({ request, context }: DataFunctionArgs) => {
  const username = await getUsername(request);

  if (isNull(username)) {
    return new Response(null, { status: 401 });
  }

  const { rooms } = context.cloudflare.env;

  const url = new URL(request.url);
  const pathname = url.pathname.replace("/api/room", "");
  const [roomName] = pathname.slice(1).split("/") as [string];
  const path = pathname.replace(`/${roomName}`, "");

  const id = rooms.idFromName(roomName);
  const room = rooms.get(id);

  const requestUrl = new URL(request.url);
  requestUrl.pathname = path;

  return room.fetch(requestUrl.toString(), request);
};

export const loader: LoaderFunction = (args) => proxyFetch(args);

export const action: ActionFunction = (args) => proxyFetch(args);
