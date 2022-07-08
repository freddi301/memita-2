import { SwarmFactory } from "./swarm";
import Hyperswarm from "hyperswarm";

export const createHyperSwarm: SwarmFactory = (onConnection) => {
  const topic = Buffer.alloc(32).fill("memita-2");
  const swarm = new Hyperswarm();
  swarm.join(topic, { server: true, client: true });
  swarm.on("connection", (stream, info) => onConnection(stream));
  return {
    async getConnections() {
      return swarm.connections.size;
    },
  };
};
