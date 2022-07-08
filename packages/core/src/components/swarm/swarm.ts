import { Duplex } from "stream";

export type SwarmFactory = (onConnection: (stream: Duplex) => void) => Swarm;

export type Swarm = {
  getConnections(): Promise<number>;
};
