import { createServer, createConnection, Socket } from "net";
import { Duplex, Readable, Writable, Transform } from "node:stream";
// @ts-ignore
import duplexify from "duplexify";

type BridgeServer = {
  port: number;
  close(): Promise<void>;
};

export async function createBridgeServer(port?: number): Promise<BridgeServer> {
  let nextSocketId = 0;
  type Entry = {
    socket: Socket;
    nextStreamId: number;
    streamMapping: Map<number, { socketId: number; streamId: number }>;
  };
  const sockets = new Map<number, Entry>();
  const server = createServer((socket) => {
    const selfSocketId = nextSocketId++;
    const self: Entry = {
      socket,
      nextStreamId: 0,
      streamMapping: new Map<number, { socketId: number; streamId: number }>(),
    };
    sockets.set(selfSocketId, self);
    for (const [otherSocketId, other] of sockets) {
      if (otherSocketId === selfSocketId) continue;
      const selfStreamId = self.nextStreamId++;
      const otherStreamId = other.nextStreamId++;
      self.streamMapping.set(selfStreamId, {
        socketId: otherSocketId,
        streamId: otherStreamId,
      });
      protocol.write(socket, { type: "open", streamId: selfStreamId });
      other.streamMapping.set(otherStreamId, {
        socketId: selfSocketId,
        streamId: selfStreamId,
      });
      protocol.write(other.socket, { type: "open", streamId: otherStreamId });
    }
    (async () => {
      while (true) {
        const message = await protocol.read(socket);
        switch (message.type) {
          case "data": {
            const entry = self.streamMapping.get(message.streamId);
            if (!entry) throw new Error();
            const other = sockets.get(entry.socketId);
            if (!other) throw new Error();
            protocol.write(other.socket, {
              type: "data",
              streamId: entry.streamId,
              data: message.data,
            });
            break;
          }
          default:
            throw new Error();
        }
      }
    })();
    socket.on("end", () => {
      for (const [selfStreamId, mapping] of self.streamMapping) {
        const other = sockets.get(mapping.socketId);
        if (other) {
          protocol.write(other.socket, {
            type: "close",
            streamId: mapping.streamId,
          });
        }
      }
      sockets.delete(selfSocketId);
    });
  });
  const port_ = await new Promise<number>((resolve) =>
    server.listen(port ?? 0, "0.0.0.0", () =>
      resolve((server.address() as any).port)
    )
  );
  return {
    port: port_,
    close() {
      return new Promise((resolve) => server.close(() => resolve(undefined)));
    },
  };
}

type BridgeClient = {
  close(): Promise<void>;
};

export async function createBridgeClient(
  port: number,
  host: string,
  onConnection: (stream: Duplex) => void
): Promise<BridgeClient> {
  const socket = await new Promise<Socket>((resolve) => {
    const socket: Socket = createConnection(port, host, () => resolve(socket));
  });
  const streams = new Map<
    number,
    { stream: Duplex; sender: Duplex; receiver: Duplex }
  >();
  (async () => {
    while (true) {
      const message = await protocol.read(socket);
      switch (message.type) {
        case "open": {
          const receiver = new Transform({
            transform(chunk, encoding, callback) {
              callback(null, chunk);
            },
          });
          const sender = new Transform({
            transform(chunk, encoding, callback) {
              protocol.write(socket, {
                type: "data",
                streamId: message.streamId,
                data: chunk,
              });
              callback(null, Buffer.from([]));
            },
          });
          const stream = duplexify(sender, receiver);
          streams.set(message.streamId, { stream, sender, receiver });
          onConnection(stream);
          break;
        }
        case "data": {
          const entry = streams.get(message.streamId);
          if (!entry) throw new Error();
          entry.receiver.write(message.data);
          break;
        }
        case "close": {
          const entry = streams.get(message.streamId);
          if (!entry) throw new Error();
          entry.stream.end();
          streams.delete(message.streamId);
          break;
        }
      }
    }
  })();
  return {
    close() {
      return new Promise((resolve) => socket.end(() => resolve(undefined)));
    },
  };
}

export function read(stream: Readable, size: number): Promise<Buffer> {
  return new Promise((resolve) =>
    (function repeat() {
      const data = stream.read(size);
      if (data !== null) resolve(data);
      else stream.once("readable", repeat);
    })()
  );
}

type Protocol = {
  open: { streamId: number };
  data: { streamId: number; data: Buffer };
  close: { streamId: number };
};

type Message = {
  [K in keyof Protocol]: { type: K } & Protocol[K];
}[keyof Protocol];

const CODES: { [K in keyof Protocol]: number } = {
  open: 1,
  data: 2,
  close: 3,
};

export const protocol = {
  async read(stream: Readable): Promise<Message> {
    const code = (await read(stream, 4)).readInt32BE();
    switch (code) {
      case CODES.open: {
        const streamId = (await read(stream, 4)).readInt32BE();
        return { type: "open", streamId };
      }
      case CODES.data: {
        const streamId = (await read(stream, 4)).readInt32BE();
        const dataLength = (await read(stream, 4)).readInt32BE();
        const data = await read(stream, dataLength);
        return { type: "data", streamId, data };
      }
      case CODES.close: {
        const streamId = (await read(stream, 4)).readInt32BE();
        return { type: "close", streamId };
      }
      default:
        throw new Error();
    }
  },
  async write(stream: Writable, message: Message) {
    switch (message.type) {
      case "open": {
        const codeBuffer = Buffer.alloc(4);
        codeBuffer.writeUInt32BE(CODES.open);
        stream.write(codeBuffer);
        const streamIdBuffer = Buffer.alloc(4);
        streamIdBuffer.writeUInt32BE(message.streamId);
        stream.write(streamIdBuffer);
        break;
      }
      case "data": {
        const codeBuffer = Buffer.alloc(4);
        codeBuffer.writeUInt32BE(CODES.data);
        stream.write(codeBuffer);
        const streamIdBuffer = Buffer.alloc(4);
        streamIdBuffer.writeUInt32BE(message.streamId);
        stream.write(streamIdBuffer);
        const dataLengthBuffer = Buffer.alloc(4);
        dataLengthBuffer.writeUInt32BE(message.data.byteLength);
        stream.write(dataLengthBuffer);
        stream.write(message.data);
        break;
      }
      case "close": {
        const codeBuffer = Buffer.alloc(4);
        codeBuffer.writeUInt32BE(CODES.close);
        stream.write(codeBuffer);
        const streamIdBuffer = Buffer.alloc(4);
        streamIdBuffer.writeUInt32BE(message.streamId);
        stream.write(streamIdBuffer);
        break;
      }
    }
  },
};
