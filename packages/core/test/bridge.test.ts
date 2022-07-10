import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { createBridgeClient } from "../src/components/bridge/bridgeClient";

test("bridge server and bridge client connects", async () => {
  const server = await createBridgeServer();
  const client = createBridgeClient(server.port, "127.0.0.1", () => {});
  await client.start();
  await client.stop();
  await server.close();
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
