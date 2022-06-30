import { Swarm, SwarmConnectionHandler } from "./swarm";

export function createTestSwarm<Data>(): Swarm<Data> {
  let nextConnectionId = 0;
  const connections = new Map<
    number,
    {
      handler: SwarmConnectionHandler<Data>;
      resolve(): void;
      isConnected: boolean;
    }
  >();
  return {
    connect(handler) {
      return new Promise((resolve) => {
        const connectionId = nextConnectionId++;
        const connection = { handler, resolve, isConnected: false };
        connections.set(connectionId, connection);
        for (const [otherConnectionId, otherConnection] of connections) {
          if (
            otherConnectionId !== connectionId &&
            !otherConnection.isConnected
          ) {
            const connectionEvents = connection.handler({
              send(data) {
                otherConnectionEvents.receive(data);
              },
              close() {
                otherConnectionEvents.close();
              },
            });
            const otherConnectionEvents = otherConnection.handler({
              send(data) {
                connectionEvents.receive(data);
              },
              close() {
                connectionEvents.close();
              },
            });
            connection.isConnected = true;
            connection.resolve();
            otherConnection.isConnected = true;
            otherConnection.resolve();
          }
        }
      });
    },
    async getConnections() {
      return nextConnectionId;
    },
  };
}
