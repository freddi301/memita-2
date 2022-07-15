import { Duplex } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import { createServer, createConnection, Socket } from "net";
import { createSocket } from "dgram";
import { networkInterfaces } from "os";

export function createLanSwarm(onConnection: (stream: Duplex) => void) {
  let isRunning = false;
  let braodcastIntervalId: NodeJS.Timer;
  let connections = new Map<string, Socket>();
  const server = createServer((socket: Socket) => {
    const otherAddress = socket.remoteAddress as string;
    const secretStream = new SecretStream(false, socket);
    onConnection(secretStream);
    connections.set(otherAddress, socket);
    socket.once("close", () => connections.delete(otherAddress));
  });
  server.on("listening", () => (isRunning = true));
  server.on("close", () => (isRunning = false));
  const UDP_BROADCAST_PORT = 6654;
  const broadcastSocket = createSocket({ type: "udp4", reuseAddr: true });
  broadcastSocket.on("listening", () => {
    broadcastSocket.setBroadcast(true);
    broadcast();
  });
  const broadcastAddresses = getBroadcastAddresses();
  function broadcast() {
    if (isRunning) {
      const { port } = server.address() as any;
      for (const [address, broadcastAddress] of Object.entries(
        broadcastAddresses
      )) {
        broadcastSocket.send(
          `${address}:${port}`,
          UDP_BROADCAST_PORT,
          broadcastAddress
        );
        broadcastSocket.send(
          `${address}:${port}`,
          UDP_BROADCAST_PORT,
          "255.255.255.255"
        );
      }
    }
  }
  broadcastSocket.on("message", (message, info) => {
    console.log("received broadcast", message.toString(), info);
    const [host, port] = message.toString().split(":");
    const otherAddress = `${host}:${port}`;
    if (!connections.has(otherAddress) && !(host in broadcastAddresses)) {
      const socket = createConnection(Number(port), host);
      connections.set(otherAddress, socket);
      const secretStream = new SecretStream(true, socket);
      socket.once("connect", () => {
        onConnection(secretStream);
      });
      socket.once("close", () => {
        connections.delete(otherAddress);
      });
    }
  });
  return {
    async getConnections() {
      return connections.size;
    },
    async start() {
      if (isRunning) return;
      await new Promise<void>((resolve) =>
        server.listen(0, "0.0.0.0", resolve)
      );
      await new Promise<void>((resolve) => {
        broadcastSocket.once("listening", resolve);
        broadcastSocket.bind(UDP_BROADCAST_PORT);
      });
      braodcastIntervalId = setInterval(broadcast, 10000);
    },
    async stop() {
      if (!isRunning) return;
      for (const [, connection] of connections) {
        connection.end();
      }
      await new Promise<void>((resolve) => {
        broadcastSocket.close(resolve);
      });
      clearInterval(braodcastIntervalId);
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve(undefined)))
      );
    },
  };
}

function getBroadcastAddresses() {
  const { lo, ...interfaces } = networkInterfaces();
  return Object.fromEntries(
    Object.values(interfaces)
      .flatMap(
        (addresses) =>
          addresses?.filter(
            (info) => info.family === "IPv4" && !info.internal
          ) ?? []
      )
      .map(({ address, netmask }) => {
        const address_splitted = address.split(".");
        const netmask_splitted = netmask.split(".");
        const broadcastAddress = address_splitted
          .map((e, i) => (~netmask_splitted[i] & 0xff) | (e as any))
          .join(".");
        return [address, broadcastAddress];
      })
  );
}
