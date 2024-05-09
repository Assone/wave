import type { ChatRoom } from "./app/models/ChatRoom";

export { ChatRoom } from "./app/models/ChatRoom";

interface Env {
  rooms: DurableObjectNamespace<ChatRoom>;
}

export default <ExportedHandler<Env>>{
  async fetch(request: Request, env) {
    const url = new URL(request.url);
    const { rooms } = env;

    if (url.pathname === "/" && request.method === "POST") {
      const { name } = await request.json<{ name: string }>();
      const id = env.rooms.idFromName(name);

      return Response.json({ id: id.toString() });
    } else {
      const pathname = url.pathname.replace("/api/room", "");
      const [roomId] = pathname.slice(1).split("/") as [string];
      const path = pathname.replace(`/${roomId}`, "");

      const id = rooms.idFromName(roomId);

      const room = rooms.get(id);

      const requestUrl = new URL(request.url);
      requestUrl.pathname = path;

      return room.fetch(requestUrl.toString(), request);
    }
  },
};
