import { createServer, Socket } from "net";
import { networkInterfaces } from "os";
import { pipeline, Writable } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import cbor from "cbor";
import { ClientToServerMessage, ServerToClientMessage } from "./bridgeProtocol";

// TODO validate messages
// TODO validate states (ex cannot end stream twice)

export function createBridgeServer(port?: number) {
  type ConnectionEntry = {
    encoder: Writable;
    nextStream: number;
    streamMapping: Map<
      number,
      { connection: ConnectionEntry; stream: number; ended: boolean }
    >;
  };
  const connections = new Map<Socket, ConnectionEntry>();
  const server = createServer((socket: Socket) => {
    const secretStream = new SecretStream(false, socket);
    const encoder = new cbor.Encoder();
    const decoder = new cbor.Decoder();
    pipeline(secretStream, decoder, () => {});
    pipeline(encoder, secretStream, () => {});
    decoder.on("end", () => encoder.end());
    const connectionEntry: ConnectionEntry = {
      encoder,
      nextStream: 0,
      streamMapping: new Map(),
    };
    connections.set(socket, connectionEntry);
    socket.on("close", () => {
      connections.delete(socket);
    });
    socket.on("end", () => {
      for (const [stream, other] of connectionEntry.streamMapping) {
        if (!other.ended) {
          const message: ServerToClientMessage = {
            type: "error",
            stream: other.stream,
          };
          other.connection.encoder.write(message);
        }
      }
    });
    socket.on("error", () => {
      for (const [stream, other] of connectionEntry.streamMapping) {
        const message: ServerToClientMessage = {
          type: "error",
          stream: other.stream,
        };
        other.connection.encoder.write(message);
      }
    });
    openSubStreams();
    decoder.on("data", (message: ClientToServerMessage) => {
      const other = connectionEntry.streamMapping.get(message.stream);
      if (!other) throw new Error();
      const write = (message: ServerToClientMessage) => {
        other.connection.encoder.write(message);
      };
      switch (message.type) {
        case "data": {
          write({ type: "data", stream: other.stream, data: message.data });
          break;
        }
        case "end": {
          other.ended = true;
          write({ type: "end", stream: other.stream });
          break;
        }
        case "error": {
          write({ type: "error", stream: other.stream });
          break;
        }
        default:
          throw new Error();
      }
    });
  });
  let isRunning = false;
  server.on("listening", () => (isRunning = true));
  server.on("close", () => (isRunning = false));
  function openSubStreams() {
    for (const [, a] of connections) {
      for (const [, b] of connections) {
        if (a === b) continue;
        if (
          Array.from(a.streamMapping.values()).some(
            ({ connection }) => connection === b
          )
        )
          continue;
        openSubStream(a, b);
      }
    }
  }
  function openSubStream(a: ConnectionEntry, b: ConnectionEntry) {
    const aSubstream = a.nextStream++;
    const bSubstream = b.nextStream++;
    a.streamMapping.set(aSubstream, {
      connection: b,
      stream: bSubstream,
      ended: false,
    });
    b.streamMapping.set(bSubstream, {
      connection: a,
      stream: aSubstream,
      ended: false,
    });
    const messageToA: ServerToClientMessage = {
      type: "open",
      stream: aSubstream,
    };
    a.encoder.write(messageToA);
    const messageToB: ServerToClientMessage = {
      type: "open",
      stream: bSubstream,
    };
    b.encoder.write(messageToB);
  }
  return {
    async getConnections() {
      return connections.size;
    },
    async getPort() {
      if (!isRunning) return null;
      const address = server.address();
      if (!address) return null;
      if (typeof address === "string") throw new Error();
      return address.port;
    },
    async getAddresses() {
      return Object.entries(networkInterfaces())
        .filter(([name]) =>
          ["VirtualBox", "VMware"].every((n) => !name.includes(n))
        )
        .flatMap(
          ([, addresses]) =>
            addresses?.filter(({ internal }) => !internal) ?? []
        )
        .map(({ address }) => address);
    },
    start() {
      if (isRunning) return Promise.resolve(undefined);
      return new Promise<void>((resolve) =>
        server.listen(port ?? 0, "0.0.0.0", resolve)
      );
    },
    stop() {
      if (!isRunning) return Promise.resolve(undefined);
      for (const [, { encoder }] of connections) {
        encoder.end();
      }
      return new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve(undefined)))
      );
    },
  };
}
