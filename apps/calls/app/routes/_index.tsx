import { isString } from "@/utils/is";
import { getUsername } from "@/utils/username";
import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const username = await getUsername(request);

  if (isString(username)) {
    return redirect("/join");
  }

  return redirect("/set-username");
};
