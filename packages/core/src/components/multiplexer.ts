import duplexify from "duplexify";
import { Duplex, PassThrough, Readable, Writable, once } from "stream";

const MAX_CHUNK_SIZE = 1024;

export function createMultiplexer(
  stream: Duplex,
  onStream: (substream: Duplex, header: Buffer) => void
) {
  checkSetup(stream);
  const subStreams = new Map<
    number,
    {
      writable: Readable;
      readable: Writable;
      duplex: Duplex;
      endNotified: boolean;
    }
  >();
  function createStream(subStreamId: number): Duplex {
    const writable = new PassThrough();
    const readable = new PassThrough();
    const duplex = duplexify(writable, readable);
    subStreams.set(subStreamId, {
      writable,
      readable,
      duplex,
      endNotified: false,
    });
    duplex.once("error", () => {
      stream.write(serialize.error(subStreamId));
      subStreams.delete(subStreamId);
    });
    stream.once("close", () => {
      duplex.destroy(new Error("carrier stream closed"));
      subStreams.delete(subStreamId);
    });
    writable.on("readable", () => {
      awake();
    });
    return duplex;
  }
  function initializeStream(header: Buffer) {
    const subStreamId = Math.trunc(Math.random() * Math.pow(2, 32));
    stream.write(serialize.open(subStreamId, header));
    return createStream(subStreamId);
  }
  let isLooping = false;
  let scheduleLoop = false;
  async function loop() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    for (const [subStreamId, subStream] of subStreams) {
      const bytesToRead = Math.min(
        subStream.writable.readableLength,
        MAX_CHUNK_SIZE
      );
      const data = subStream.writable.read(bytesToRead);
      if (data) {
        await new Promise((resolve, reject) =>
          stream.write(serialize.data(subStreamId, data), (error) => {
            if (error) reject(error);
            else resolve(undefined);
          })
        );
      }
      if (subStream.writable.readableEnded && !subStream.endNotified) {
        subStream.endNotified = true;
        stream.write(serialize.end(subStreamId));
      }
    }
  }
  async function awake() {
    if (isLooping) {
      scheduleLoop = true;
    } else {
      isLooping = true;
      await loop();
      isLooping = false;
      if (scheduleLoop) {
        scheduleLoop = false;
        awake();
      }
    }
  }
  const handlers: Deserialize = {
    open(subStreamId, header) {
      const subStream = subStreams.get(subStreamId);
      if (subStream) throw new Error("sub stream already exists");
      onStream(createStream(subStreamId), header);
    },
    data(subStreamId, data) {
      const subStream = subStreams.get(subStreamId);
      if (!subStream) throw new Error("sub stream does not exist");
      subStream.readable.write(data);
    },
    end(subStreamId) {
      const subStream = subStreams.get(subStreamId);
      if (!subStream) throw new Error("sub stream does not exist");
      subStream.readable.end();
    },
    error(subStreamId) {
      const subStream = subStreams.get(subStreamId);
      if (!subStream) throw new Error("sub stream does not exist");
      subStream.duplex.destroy(new Error("sub stream error on other side"));
    },
  };

  (async () => {
    while (stream.readable) {
      await once(stream, "readable");
      if (stream.readable) await deserialize(stream, handlers);
    }
  })();

  return {
    createStream: initializeStream,
  };
}

function checkSetup(stream: Duplex) {
  if (stream.readableObjectMode)
    throw new Error("carrier stream readable mode must be binary");
  if (stream.readableObjectMode)
    throw new Error("carrier stream writable mode must be binary");
  if (stream.readableFlowing) throw new Error("carrier stream must be paused");
}

const codes = {
  open: 1,
  data: 2,
  end: 3,
  error: 4,
};

type Protocol = {
  open(subStreamId: number, header: Buffer): void;
  data(subStreamId: number, data: Buffer): void;
  end(subStreamId: number): void;
  error(subStreamId: number): void;
};

type Serialize = {
  [M in keyof Protocol]: (...args: Parameters<Protocol[M]>) => Buffer;
};

type Deserialize = {
  [M in keyof Protocol]: (...args: Parameters<Protocol[M]>) => void;
};

const serialize: Serialize = {
  open(subStreamId, header): Buffer {
    const buffer = Buffer.alloc(1 + 4 + 4);
    buffer.writeUInt8(codes.open, 0);
    buffer.writeUint32BE(subStreamId, 1);
    buffer.writeUint32BE(header.byteLength, 5);
    return Buffer.concat([buffer, header]);
  },
  data(subStreamId, data): Buffer {
    const buffer = Buffer.alloc(1 + 4 + 4);
    buffer.writeUInt8(codes.data, 0);
    buffer.writeUint32BE(subStreamId, 1);
    buffer.writeUint32BE(data.byteLength, 5);
    return Buffer.concat([buffer, data]);
  },
  end(subStreamId): Buffer {
    const buffer = Buffer.alloc(1 + 4);
    buffer.writeUInt8(codes.end, 0);
    buffer.writeUint32BE(subStreamId, 1);
    return buffer;
  },
  error(subStreamId): Buffer {
    const buffer = Buffer.alloc(1 + 4);
    buffer.writeUInt8(codes.error, 0);
    buffer.writeUint32BE(subStreamId, 1);
    return buffer;
  },
};

async function deserialize(stream: Readable, handlers: Deserialize) {
  const code = (await readBytes(stream, 1)).readUInt8();
  switch (code) {
    case codes.open: {
      const subStreamId = (await readBytes(stream, 4)).readUInt32BE();
      const dataByteLength = (await readBytes(stream, 4)).readUInt32BE();
      const data = await readBytes(stream, dataByteLength);
      handlers.open(subStreamId, data);
      break;
    }
    case codes.data: {
      const subStreamId = (await readBytes(stream, 4)).readUInt32BE();
      const dataByteLength = (await readBytes(stream, 4)).readUInt32BE();
      if (dataByteLength > MAX_CHUNK_SIZE) throw new Error("chunk too large");
      const data = await readBytes(stream, dataByteLength);
      handlers.data(subStreamId, data);
      break;
    }
    case codes.end: {
      const subStreamId = (await readBytes(stream, 4)).readUInt32BE();
      handlers.end(subStreamId);
      break;
    }
    case codes.error: {
      const subStreamId = (await readBytes(stream, 4)).readUInt32BE();
      handlers.error(subStreamId);
      break;
    }
    default:
      throw new Error("protocol error");
  }
}

function readBytes(stream: Readable, bytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (!stream.readable) reject(new Error("cannot read from stream"));
    const buffer = stream.read(bytes);
    if (buffer) {
      resolve(buffer);
    } else {
      const onClose = () => reject(new Error("stream closed"));
      const onEnd = () => reject(new Error("stream ended"));
      const onReadable = () => {
        const buffer = stream.read(bytes);
        if (buffer) {
          resolve(buffer);
          stream.off("close", onClose);
          stream.off("end", onEnd);
          stream.off("readable", onReadable);
        }
      };
      stream.once("close", onClose);
      stream.once("end", onEnd);
      stream.on("readable", onReadable);
    }
  });
}
