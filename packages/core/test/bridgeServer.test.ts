import {
  createBridgeServer,
  createBridgeClient,
  read,
  protocol,
} from "../src/components/bridgeServer";
import { Transform } from "node:stream";

test("bridge server and bridge client connects", async () => {
  const server = await createBridgeServer();
  const client = await createBridgeClient(server.port, "127.0.0.1", () => {});
  await client.close();
  await server.close();
});

test("async read size", async () => {
  const stream = new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk);
    },
  });
  setTimeout(() => stream.write(Buffer.from([0x61])), 10);
  setTimeout(() => stream.write(Buffer.from([0x62])), 20);
  setTimeout(() => stream.write(Buffer.from([0x63])), 30);
  expect(await read(stream, 3)).toEqual(Buffer.from([0x61, 0x62, 0x63]));
  setTimeout(() => stream.write(Buffer.from([0x64])), 40);
  setTimeout(() => stream.write(Buffer.from([0x65])), 50);
  setTimeout(() => stream.write(Buffer.from([0x66])), 60);
  expect(await read(stream, 3)).toEqual(Buffer.from([0x64, 0x65, 0x66]));
  stream.end();
});

test("protocol", async () => {
  const stream = new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk);
    },
  });
  await protocol.write(stream, { type: "open", streamId: 42 });
  expect(await protocol.read(stream)).toEqual({ type: "open", streamId: 42 });
  await protocol.write(stream, {
    type: "data",
    streamId: 42,
    data: Buffer.from([0x61, 0x62]),
  });
  expect(await protocol.read(stream)).toEqual({
    type: "data",
    streamId: 42,
    data: Buffer.from([0x61, 0x62]),
  });
  await protocol.write(stream, { type: "close", streamId: 42 });
  expect(await protocol.read(stream)).toEqual({ type: "close", streamId: 42 });
  stream.end();
});

test("bridge server connects two clients", async () => {
  const server = await createBridgeServer();
  const payload = Math.random();
  const clientA = await createBridgeClient(
    server.port,
    "127.0.0.1",
    (connection) => {
      connection.write(`${payload}`);
      connection.end();
    }
  );
  let resolution: any;
  const clientB = await createBridgeClient(
    server.port,
    "127.0.0.1",
    (connection) => {
      connection.once("data", (data) => {
        resolution(data.toString());
        connection.end();
      });
    }
  );
  expect(
    await new Promise((resolve) => {
      resolution = resolve;
    })
  ).toEqual(`${payload}`);
  clientA.close();
  clientB.close();
  server.close();
});
