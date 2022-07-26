import { createServer, createConnection } from "net";
import { createMultiplexer } from "../src/components/multiplexer";
import { deferable } from "./utils/deferable";

test("multiplexer", async () => {
  const server = createServer((socket) => {
    createMultiplexer(socket, (stream) => {
      stream.on("data", (data: Buffer) => {
        stream.write(data.toString().toUpperCase());
        stream.end();
      });
    });
  });
  await new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(undefined))
  );
  const serverPort = (server.address() as any).port as number;
  const aResponse = deferable();
  const bResponse = deferable();
  const client = createConnection(serverPort, "127.0.0.1", () => {
    const createStream = createMultiplexer(client, () => {});
    const a = createStream();
    const b = createStream();
    a.write(Buffer.from("hello"));
    b.write(Buffer.from("world"));
    a.on("data", (data) => {
      aResponse.resolve(data.toString());
    });
    b.on("data", (data) => {
      bResponse.resolve(data.toString());
    });
    a.end();
    b.end();
  });
  expect(await aResponse.promise).toEqual("HELLO");
  expect(await bResponse.promise).toEqual("WORLD");
  client.end();
  await new Promise((resolve) => server.close(() => resolve(undefined)));
});
