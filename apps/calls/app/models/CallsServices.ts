import {
  requestCallsApi,
  type CloseTracksRequest,
  type NewSessionRequest,
  type NewSessionResponse,
  type RenegotiateRequest,
  type RenegotiationResponse,
  type TracksRequest,
  type TracksResponse,
} from "@/routes/api.calls.$";

export default class CallsServices {
  sessionId?: string;

  async createSession(data: NewSessionRequest) {
    const response = await requestCallsApi<NewSessionResponse>({
      method: "POST",
      url: "/sessions/new",
      body: data,
    });

    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }

    this.sessionId = response.sessionId;

    return response;
  }

  async renegotiateSession(data: RenegotiateRequest) {
    const response = await requestCallsApi<RenegotiationResponse>({
      method: "PUT",
      url: `/sessions/${this.sessionId}/renegotiate`,
      body: data,
    });

    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }

    return response;
  }

  async addNewTrack(data: TracksRequest) {
    const response = await requestCallsApi<TracksResponse>({
      method: "POST",
      url: `/sessions/${this.sessionId}/tracks/new`,
      body: data,
    });

    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }

    return response;
  }

  async closeTrack(data: CloseTracksRequest) {
    const response = await requestCallsApi<TracksResponse>({
      method: "POST",
      url: `/sessions/${this.sessionId}/tracks/new`,
      body: data,
    });

    if (response.errorCode) {
      throw new Error(response.errorDescription);
    }

    return response;
  }
}
