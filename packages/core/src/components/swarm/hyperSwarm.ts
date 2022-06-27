import { Swarm } from "./swarm";
import Hyperswarm from "hyperswarm";

export function createHyperSwarm(): Swarm<Buffer> {
  const topic = Buffer.alloc(32).fill("memita-2");
  const swarm = new Hyperswarm();
  swarm.join(topic, { server: true, client: true });
  return {
    connect(handler) {
      return new Promise((resolve) => {
        swarm.once("connection", (connection, info) => {
          const { receive, close } = handler({
            send(data) {
              connection.write(data);
            },
            close() {
              connection.end();
            },
          });
          connection.on("data", receive);
          connection.on("close", close);
          resolve();
        });
      });
    },
  };
}
