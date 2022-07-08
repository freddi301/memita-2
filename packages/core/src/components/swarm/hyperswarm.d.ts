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
    join(topic: Buffer, options: { server: boolean; client: boolean }): void;
    connections: Set<unknown>;
  }
  type PeerInfo = {
    pulicKey: Buffer;
    ban(): void;
  };
}
