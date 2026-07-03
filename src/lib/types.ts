export const MSG_MAX_LEN = 140;

export interface UnvalidatedClientMessage {
  text: string;
}

export interface WsPayload {
  text: string;
  isoCode?: string;
  timestamp: string;
}
