import { createConnection, Socket } from "net";
import { Duplex, Transform, PassThrough, Writable } from "stream";
import duplexify from "duplexify";
import { pipeline } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import cbor from "cbor";
import { ClientToServerMessage, ServerToClientMessage } from "./bridgeProtocol";

// TODO validate messages
// TODO validate states (ex: cannot open a stream twice)

export function createBridgeClient(
  port: number,
  host: string,
  onConnection: (stream: Duplex) => void
) {
  let connections = 0;
  async function connect() {
    const socket = createConnection(port, host);
    const secretStream = new SecretStream(true, socket);
    const encoder = new cbor.Encoder();
    const decoder = new cbor.Decoder();
    pipeline(secretStream, decoder, () => {});
    pipeline(encoder, secretStream, () => {});
    decoder.on("end", () => encoder.end());
    await new Promise((resolve) => socket.once("connect", resolve));
    const streams = new Map<number, { receiver: Duplex }>();
    decoder.on("data", (message: ServerToClientMessage) => {
      switch (message.type) {
        case "open": {
          const stream = message.stream;
          const sender = new Transform({
            readableObjectMode: true,
            writableObjectMode: false,
            transform(chunk, encoding, callback) {
              const envelope: ClientToServerMessage = {
                type: "data",
                stream,
                data: chunk,
              };
              callback(null, envelope);
            },
          });
          sender.on("end", () => {
            const message: ClientToServerMessage = { type: "end", stream };
            encoder.write(message);
          });
          sender.pipe(encoder, { end: false });
          const receiver = new PassThrough();
          streams.set(stream, { receiver });
          const duplex = duplexify(sender, receiver);
          connections++;
          duplex.on("close", () => connections--);
          onConnection(duplex);
          break;
        }
        case "data": {
          const stream = streams.get(message.stream);
          if (!stream) throw new Error();
          stream.receiver.write(message.data);
          break;
        }
        case "end": {
          const stream = streams.get(message.stream);
          if (!stream) throw new Error();
          stream.receiver.end();
          break;
        }
        case "error": {
          const stream = streams.get(message.stream);
          if (!stream) throw new Error();
          stream.receiver.destroy(new Error("stream destroyed on other side"));
          break;
        }
      }
    });
    return { socket, encoder };
  }
  let instance:
    | { type: "resting" }
    | { type: "connecting"; promise: Promise<void> }
    | { type: "connected"; socket: Socket; encoder: Writable }
    | { type: "error" } = {
    type: "resting",
  };
  return {
    async getConnections() {
      return connections;
    },
    async start() {
      if (instance.type === "resting") {
        const promise = connect().then(
          ({ socket, encoder }) => {
            instance = { type: "connected", socket, encoder };
          },
          (error) => {
            console.error(error);
            instance = { type: "error" };
          }
        );
        instance = { type: "connecting", promise };
      }
    },
    async stop() {
      switch (instance.type) {
        case "connected": {
          const { encoder, socket } = instance;
          encoder.end();
          return new Promise((resolve) => socket.once("close", resolve));
        }
        case "connecting": {
          await instance.promise;
          await this.stop();
          break;
        }
        case "error": {
          instance = { type: "resting" };
          break;
        }
      }
    },
  };
}
