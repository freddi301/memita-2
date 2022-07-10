import { createServer, Socket } from "net";
import { pipeline, Writable } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import cbor from "cbor";
import { ClientToServerMessage, ServerToClientMessage } from "./bridgeProtocol";

// TODO validate messages
// TODO validate states (ex cannot end stream twice)

export async function createBridgeServer(port?: number) {
  type ConnectionEntry = {
    encoder: Writable;
    nextStream: number;
    streamMapping: Map<number, { connection: ConnectionEntry; stream: number }>;
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
      for (const [stream, other] of connectionEntry.streamMapping) {
        const message: ServerToClientMessage = { type: "error", stream };
        other.connection.encoder.write(message);
      }
    });
    openSubStreams();
    decoder.on("data", (message: ClientToServerMessage) => {
      const other = connectionEntry.streamMapping.get(message.stream);
      if (!other) throw new Error();
      const write = (message: ServerToClientMessage) =>
        other.connection.encoder.write(message);
      switch (message.type) {
        case "data": {
          write({ type: "data", stream: other.stream, data: message.data });
          break;
        }
        case "end": {
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
  await new Promise<void>((resolve) =>
    server.listen(port ?? 0, "0.0.0.0", resolve)
  );
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
    });
    b.streamMapping.set(bSubstream, {
      connection: a,
      stream: aSubstream,
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
    port: (server.address() as any).port,
    close() {
      for (const [, { encoder }] of connections) {
        encoder.end();
      }
      return new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve(undefined)))
      );
    },
  };
}
