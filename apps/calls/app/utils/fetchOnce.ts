import invariant from "tiny-invariant";

export default async function fetchOnce(...args: Parameters<typeof fetch>) {
  invariant(
    !args.some((a) => a instanceof Request),
    "fetchOnce cannot cache with Request parameters"
  );
  const cache = new Map<string, Response>();
  const key = JSON.stringify(args);
  let result = cache.get(key);
  if (result) {
    return result.clone();
  } else {
    result = await fetch(...args);
    cache.set(key, result);
    return result.clone();
  }
}
