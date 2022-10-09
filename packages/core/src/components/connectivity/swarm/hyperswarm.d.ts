declare module "hyperswarm" {
  export default Swarm;
  declare class Swarm {
    on(
      event: "connection",
      callback: (connection: Duplex, info: PeerInfo) => void
    ): void;
    once(
      event: "connection",
      callback: (connection: Duplex, info: PeerInfo) => void
    ): void;
    join(
      topic: Buffer,
      options: { server: boolean; client: boolean }
    ): Promise<void>;
    leave(topic: Buffer): Promise<void>;
    destroy(): Promise<void>;
    connections: Set<Duplex>;
  }
  type PeerInfo = {
    pulicKey: Buffer;
    ban(): void;
  };
}
