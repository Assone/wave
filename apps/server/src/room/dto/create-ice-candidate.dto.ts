export class CreateIceCandidateDto {
  sid: string;
  candidate: RTCIceCandidate;
  type: 'client' | 'host';
}
