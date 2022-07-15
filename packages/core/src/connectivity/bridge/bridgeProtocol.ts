type ClientToServerMessages = {
  data: { stream: number; data: Buffer };
  end: { stream: number };
  error: { stream: number };
};

type ServerToClientMessages = {
  open: { stream: number };
  data: { stream: number; data: Buffer };
  end: { stream: number };
  error: { stream: number };
};

export type ClientToServerMessage = {
  [K in keyof ClientToServerMessages]: { type: K } & ClientToServerMessages[K];
}[keyof ClientToServerMessages];

export type ServerToClientMessage = {
  [K in keyof ServerToClientMessages]: { type: K } & ServerToClientMessages[K];
}[keyof ServerToClientMessages];
