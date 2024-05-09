import { json, type ActionFunction } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ context, request }) => {
  if (request.method === "POST") {
    const { name } = await request.json<{ name: string }>();
    const id = context.cloudflare.env.rooms.idFromName(name);

    return json(
      { id: id.toString() },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }

  return new Response("Method not allowed", { status: 405 });
};
