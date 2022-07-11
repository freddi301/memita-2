import { createConnection, Socket } from "net";
import { Duplex, Transform, PassThrough, Writable } from "stream";
import duplexify from "duplexify";
import { pipeline } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import cbor from "cbor";
import { ClientToServerMessage, ServerToClientMessage } from "./bridgeProtocol";

// TODO validate messages
// TODO validate states (ex: cannot open a stream twice)

export function createBridgeClient(onConnection: (stream: Duplex) => void) {
  let connections = 0;
  async function connect(port: number, host: string) {
    const socket = createConnection(port, host);
    const secretStream = new SecretStream(true, socket);
    const encoder = new cbor.Encoder();
    const decoder = new cbor.Decoder();
    pipeline(secretStream, decoder, () => {});
    pipeline(encoder, secretStream, () => {});
    decoder.on("end", () => encoder.end());
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
    await new Promise((resolve, reject) => {
      socket.on("error", reject);
      socket.on("connect", () => {
        resolve(undefined);
        socket.off("error", reject);
      });
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
    async isOnline(): Promise<boolean> {
      if (instance.type === "connected") {
        return instance.socket.readable && instance.socket.writable;
      }
      if (instance.type === "connecting") {
        await instance.promise;
        return await this.isOnline();
      }
      return false;
    },
    async start(port: number, host: string) {
      if (instance.type === "resting") {
        const promise = connect(port, host).then(
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
          await new Promise((resolve) => socket.once("close", resolve));
          instance = { type: "resting" };
          break;
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
