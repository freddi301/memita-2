import { AccountId, ConnectivitySettings, NetworkUiQueries } from "../components/Api";
import { createHyperSwarm } from "./connectivity/swarm/hyperSwarm";
import { createBridgeClient } from "./connectivity/bridge/bridgeClient";
import { createBridgeServer } from "./connectivity/bridge/bridgeServer";
import { createLanSwarm } from "./connectivity/swarm/lanSwarm";
import { Duplex } from "stream";
import { createMultiplexer } from "../components/multiplexer";

export type ConnectivityService = {
  connectAccount(account: AccountId, settings: ConnectivitySettings): void;
  disconnectAccount(account: AccountId): void;
  stop(): void;
  uiApi: NetworkUiQueries;
};

type ConnectivityModuleInstances = {
  hyperswarm: ReturnType<typeof createHyperSwarm>;
  bridgeServer: ReturnType<typeof createBridgeServer>;
  bridgeClients: Array<ReturnType<typeof createBridgeClient>>;
  lan: ReturnType<typeof createLanSwarm>;
};

export function createConnectivityService(handler: (stream: Duplex, header: Buffer) => void): ConnectivityService {
  const connectivityModuleInstances = new Map<AccountId, ConnectivityModuleInstances>();
  function onConnection(stream: Duplex) {
    const multiplexer = createMultiplexer(stream, handler);
  }
  return {
    async connectAccount(account, connectivity) {
      let instances = connectivityModuleInstances.get(account)!;
      if (!instances) {
        instances = {
          hyperswarm: createHyperSwarm(onConnection),
          bridgeServer: createBridgeServer(),
          bridgeClients: connectivity.bridge.clients.map(() => createBridgeClient(onConnection)),
          lan: createLanSwarm(onConnection),
        };
        connectivityModuleInstances.set(account, instances);
      }
      if (connectivity.hyperswarm.enabled) {
        await instances.hyperswarm.start();
      } else {
        await instances.hyperswarm.stop();
      }
      if (connectivity.bridge.server.enabled) {
        await instances.bridgeServer.start();
      } else {
        await instances.bridgeServer.stop();
      }
      for (let index = 0; index < connectivity.bridge.clients.length; index++) {
        const bridge = connectivity.bridge.clients[index];
        const instance = instances.bridgeClients[index];
        if (bridge.enabled) {
          await instance.start(bridge.port, bridge.host);
        } else {
          await instance.stop();
        }
      }
      if (connectivity.lan.enabled) {
        await instances.lan.start();
      } else {
        await instances.lan.stop();
      }
    },
    async disconnectAccount(account) {
      const instances = connectivityModuleInstances.get(account);
      if (instances) {
        await instances.hyperswarm.stop();
        for (const client of instances.bridgeClients) {
          await client.stop();
        }
        await instances.bridgeServer.stop();
        await instances.lan.stop();
        connectivityModuleInstances.delete(account);
      }
    },
    async stop() {
      for (const [, instances] of connectivityModuleInstances) {
        await instances.hyperswarm.stop();
        for (const bridgeClient of instances.bridgeClients) {
          await bridgeClient.stop();
        }
        await instances.bridgeServer.stop();
        await instances.lan.stop();
      }
    },
    uiApi: {
      async getConnectionsState(account) {
        const instances = connectivityModuleInstances.get(account);
        if (!instances) return;
        const serverPort = await instances.bridgeServer.getPort();
        return {
          hyperswarm: {
            connections: await instances.hyperswarm.getConnections(),
          },
          bridge: {
            server: serverPort
              ? {
                  port: serverPort,
                  adresses: await instances.bridgeServer.getAddresses(),
                  connections: await instances.bridgeServer.getConnections(),
                }
              : undefined,
            clients: await Promise.all(
              instances.bridgeClients.map(async (bridge) => ({
                online: await bridge.isOnline(),
                connections: await bridge.getConnections(),
              }))
            ),
          },
          lan: {
            connections: await instances.lan.getConnections(),
          },
        };
      },
    },
  };
}
