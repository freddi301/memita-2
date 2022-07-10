import Hyperswarm from "hyperswarm";
import { Duplex } from "stream";

export function createHyperSwarm(onConnection: (stream: Duplex) => void) {
  const topic = Buffer.alloc(32).fill("memita-2");
  const swarm = new Hyperswarm();
  swarm.on("connection", (stream, info) => onConnection(stream));
  return {
    async getConnections() {
      return swarm.connections.size;
    },
    async start() {
      await swarm.join(topic, { server: true, client: true });
    },
    async stop() {
      await swarm.leave(topic);
    },
  };
}
