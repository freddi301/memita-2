import { createBridgeClient } from "../bridge/bridgeClient";
import { SwarmFactory } from "./swarm";

export function createBridgeSwarm(port: number, host: string): SwarmFactory {
  return (onConnection) => {
    let connections = 0;
    createBridgeClient(port, host, (stream) => {
      connections++;
      stream.on("close", () => connections--);
      onConnection(stream);
    });
    return {
      getConnections() {
        return Promise.resolve(connections);
      },
    };
  };
}
