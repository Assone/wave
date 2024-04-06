// eslint-disable-next-line @typescript-eslint/ban-types
export type P2PMessage<T extends Record<string, unknown> = {}> = {
  sid: string;
} & T;
