import Hyperswarm from "hyperswarm";
import { Duplex } from "stream";

export function createHyperSwarm(onConnection: (stream: Duplex) => void) {
  const topic = Buffer.alloc(32).fill("memita-2");
  let swarm: Hyperswarm | null;
  return {
    async getConnections() {
      return swarm?.connections.size ?? 0;
    },
    async start() {
      if (!swarm) {
        swarm = new Hyperswarm();
        swarm.on("connection", (stream, info) => onConnection(stream));
        await swarm.join(topic, { server: true, client: true });
      }
    },
    async stop() {
      if (swarm) {
        const leaving = swarm.leave(topic);
        swarm = null;
        await leaving;
      }
    },
  };
}
