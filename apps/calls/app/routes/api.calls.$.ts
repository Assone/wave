import {
  type ActionFunction,
  type DataFunctionArgs,
  type LoaderFunction,
} from "@remix-run/cloudflare";
import invariant from "tiny-invariant";

const formatUrl = (appid: string, url: string) => {
  const originUrl = new URL(url);
  const targetUrl = new URL("https://rtc.live.cloudflare.com");

  targetUrl.pathname = originUrl.pathname.replace(
    "/api/calls",
    `/v1/apps/${appid}`
  );
  targetUrl.search = originUrl.search;

  return targetUrl;
};

const proxyFetch = ({ request, context }: DataFunctionArgs) => {
  const url = formatUrl(context.cloudflare.env.CALLS_APP_ID, request.url);

  const headers = new Headers(request.headers);
  headers.set(
    "Authorization",
    `Bearer ${context.cloudflare.env.CALLS_APP_SECRET}`
  );
  headers.set("Accept-Encoding", "identity");

  const options: RequestInit & { duplex: "half" } = {
    headers,
    method: request.method,
    duplex: "half",
  };

  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const parseContentLength = Number(contentLength);

    invariant(
      !isNaN(parseContentLength),
      "Content-Length header is not a number"
    );

    if (parseContentLength > 0 || headers.get("Transfer-Encoding")) {
      options.body = request.body;
    }
  }

  return fetch(url, options);
};

export const loader: LoaderFunction = (args) => proxyFetch(args);

export const action: ActionFunction = (args) => proxyFetch(args);

export interface SessionDescription extends RTCSessionDescriptionInit {}

export interface ErrorResponse {
  errorCode?: string;
  errorDescription?: string;
}

export type NewSessionRequest = {
  sessionDescription: SessionDescription;
};

export interface NewSessionResponse extends ErrorResponse {
  sessionDescription: SessionDescription;
  sessionId: string;
}

export type TrackObject = {
  location?: "local" | "remote";
  trackName?: string;
  sessionId?: string;
  mid?: string | null;
};

export type TracksRequest = {
  tracks: TrackObject[];
  sessionDescription?: SessionDescription;
};

export interface TracksResponse extends ErrorResponse {
  sessionDescription: SessionDescription;
  requiresImmediateRenegotiation: boolean;
  tracks?: (TrackObject & ErrorResponse)[];
}

export type RenegotiateRequest = {
  sessionDescription: SessionDescription;
};

export interface RenegotiationResponse extends ErrorResponse {}

export type CloseTracksRequest = TracksRequest & {
  force: boolean;
};

export interface EmptyResponse extends ErrorResponse {}

export type CallsRequest =
  | NewSessionRequest
  | TracksRequest
  | RenegotiateRequest
  | CloseTracksRequest;
export type CallsResponse = EmptyResponse | TracksResponse;

interface CallsApiRequestOptions
  extends Omit<RequestInit, "mode" | "body" | "headers" | "redirect"> {
  url: string;
  body: CallsRequest;
  baseUrl?: string;
}

interface CallsApiCommonOptions {
  retryCount?: number;
}

export const requestCallsApi = async <R extends CallsResponse>(
  request: CallsApiRequestOptions,
  options: CallsApiCommonOptions = {}
): Promise<R> => {
  const {
    url: endpoint,
    body,
    method,
    baseUrl = window.location.origin,
    ...config
  } = request;
  const { retryCount = 0 } = options;

  const url = new URL(`/api/calls${endpoint}`, baseUrl);
  const fetchOption = {
    ...config,
    method,
    mode: "cors",
    redirect: "manual",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  } satisfies RequestInit;

  try {
    const response = await fetch(url, fetchOption);

    if (response.status === 0) {
      alert("Access session is expired, reloading page.");
      location.reload();
    }

    const json = await response.json<R>();

    return json;
  } catch (error) {
    console.error("Calls API Error", error);

    if (retryCount <= 0) {
      throw error;
    }

    return requestCallsApi(request, { ...options, retryCount: retryCount - 1 });
  }
};
