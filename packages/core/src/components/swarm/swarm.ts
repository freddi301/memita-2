export type Swarm<Data> = {
  connect(handler: SwarmConnectionHandler<Data>): Promise<void>;
};

export type SwarmConnectionHandler<Data> = (
  commands: SwarmConnectionCommands<Data>
) => SwarmConnectionEvents<Data>;

type SwarmConnectionCommands<Data> = {
  send(data: Data): void;
  close(): void;
};

type SwarmConnectionEvents<Data> = {
  receive(data: Data): void;
  close(): void;
};
