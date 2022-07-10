import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { createBridgeClient } from "../src/components/bridge/bridgeClient";
import { PassThrough } from "stream";
import duplexify from "duplexify";
import { deferable } from "./deferable";

test("passtrough correctly ends streams", async () => {
  const duplex = new PassThrough();
  const trace: Array<string> = [];
  duplex.on("end", () => trace.push("duplex ended"));
  const ended = new Promise((resolve) => duplex.on("end", resolve));
  duplex.on("data", (data) => trace.push(data.toString()));
  duplex.write("some data");
  duplex.end();
  await ended;
  expect(trace).toEqual(["some data", "duplex ended"]);
});

test("duplexify correclty ends streams", async () => {
  const sender = new PassThrough();
  const receiver = new PassThrough();
  const duplex = duplexify(sender, receiver);
  const receiverEnded = new Promise((resolve) => receiver.on("end", resolve));
  const duplexEnded = new Promise((resolve) => duplex.on("end", resolve));
  const trace: Array<string> = [];
  receiver.on("end", () => trace.push("receiver ended"));
  duplex.on("end", () => trace.push("duplex ended"));
  receiver.end();
  duplex.on("data", () => {});
  await receiverEnded;
  await duplexEnded;
  expect(trace).toEqual(["receiver ended", "duplex ended"]);
});

test("bridge server and bridge client connects", async () => {
  const trace: Array<string> = [];
  const server = await createBridgeServer();
  const client = createBridgeClient(server.port, "127.0.0.1", (connection) => {
    trace.push("got connection");
    connection.on("data", () => {});
  });
  await client.start();
  await client.stop();
  await server.close();
  expect(trace).toEqual([]);
});

test("bridge clients gracefully end connections", async () => {
  const trace: Array<string> = [];
  const server = await createBridgeServer();
  const clientAGotConnection = deferable<void>();
  const clientAConnectionEnded = deferable<void>();
  const clientA = createBridgeClient(server.port, "127.0.0.1", (connection) => {
    clientAGotConnection.resolve();
    trace.push("clientA got connection");
    connection.on("data", () => {});
    connection.on("end", () => {
      clientAConnectionEnded.resolve();
      trace.push("clientA connection ended");
    });
    connection.end();
  });
  const clientBGotConnection = deferable<void>();
  const clientBConnectionEnded = deferable<void>();
  const clientB = createBridgeClient(server.port, "127.0.0.1", (connection) => {
    clientBGotConnection.resolve();
    trace.push("clientB got connection");
    connection.on("data", () => {});
    connection.on("end", () => {
      clientBConnectionEnded.resolve();
      trace.push("clientB connection ended");
    });
    connection.end();
  });
  await clientA.start();
  await clientB.start();
  await clientAGotConnection.promise;
  await clientBGotConnection.promise;
  await clientAConnectionEnded.promise;
  await clientBConnectionEnded.promise;
  await server.close();
  expect(trace).toEqual([
    "clientA got connection",
    "clientB got connection",
    "clientB connection ended",
    "clientA connection ended",
  ]);
});

test("bridge server connects two clients", async () => {
  const server = await createBridgeServer();
  const payload = Math.random();
  let aConnections = 0;
  let bConnections = 0;
  const clientA = createBridgeClient(server.port, "127.0.0.1", (connection) => {
    aConnections++;
    connection.write(`${payload}`);
    connection.end();
  });
  await clientA.start();
  let resolution: any;
  const clientB = createBridgeClient(server.port, "127.0.0.1", (connection) => {
    bConnections++;
    connection.once("data", (data) => {
      resolution(data.toString());
      connection.end();
    });
  });
  await clientB.start();
  expect(
    await new Promise((resolve) => {
      resolution = resolve;
    })
  ).toEqual(`${payload}`);
  expect(await clientA.getConnections()).toEqual(1);
  expect(await clientB.getConnections()).toEqual(1);
  await clientA.stop();
  await clientB.stop();
  await server.close();
  expect(aConnections).toEqual(1);
  expect(bConnections).toEqual(1);
});
