import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { createBridgeClient } from "../src/components/bridge/bridgeClient";

test("bridge server and bridge client connects", async () => {
  const server = await createBridgeServer();
  const client = await createBridgeClient(server.port, "127.0.0.1", () => {});
  await client.close();
  await server.close();
});

test("bridge server connects two clients", async () => {
  const server = await createBridgeServer();
  const payload = Math.random();
  let aConnections = 0;
  let bConnections = 0;
  const clientA = await createBridgeClient(
    server.port,
    "127.0.0.1",
    (connection) => {
      aConnections++;
      connection.write(`${payload}`);
      connection.end();
    }
  );
  let resolution: any;
  const clientB = await createBridgeClient(
    server.port,
    "127.0.0.1",
    (connection) => {
      bConnections++;
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
  await clientA.close();
  await clientB.close();
  await server.close();
  expect(aConnections).toEqual(1);
  expect(bConnections).toEqual(1);
});
