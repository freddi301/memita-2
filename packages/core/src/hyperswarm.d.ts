declare module "hyperswarm" {
  export default Swarm;
  declare class Swarm {
    on(
      event: "connection",
      callback: (connection: Connection, info: PeerInfo) => void
    ): void;
    join(topic: Buffer, options: { server: boolean; client: boolean }): void;
  }
  export type Connection = {
    write(data: Buffer | string): void;
    on(event: "data", callback: (data: Buffer) => void): void;
    on(event: "error", callback: (error: unknown) => void): void;
    on(event: "close", callback: () => void): void;
    end(): void;
    destroy(): void;
  };
  type PeerInfo = {
    pulicKey: Buffer;
    ban(): void;
  };
}