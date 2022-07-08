import { createConnection } from "net";
import { Duplex, Transform, PassThrough } from "stream";
import duplexify from "duplexify";
import { pipeline } from "stream";
const SecretStream = require("@hyperswarm/secret-stream");
import cbor from "cbor";
import { ClientToServerMessage, ServerToClientMessage } from "./bridgeProtocol";

// TODO validate messages
// TODO validate states (ex: cannot open a stream twice)

export async function createBridgeClient(
  port: number,
  host: string,
  onConnection: (stream: Duplex) => void
) {
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
        const sender = new Transform({
          readableObjectMode: true,
          writableObjectMode: false,
          transform(chunk, encoding, callback) {
            const envelope: ClientToServerMessage = {
              type: "data",
              stream: message.stream,
              data: chunk,
            };
            callback(null, envelope);
          },
        });
        sender.pipe(encoder);
        const receiver = new PassThrough();
        streams.set(message.stream, { receiver });
        onConnection(duplexify(sender, receiver));
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
  return {
    async close() {
      encoder.end();
      return new Promise((resolve, reject) =>
        socket.once("close", (hasError) => {
          if (hasError) reject();
          else resolve(undefined);
        })
      );
    },
  };
}
