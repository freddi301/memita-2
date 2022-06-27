import { createTestSwarm } from "../src/components/swarm/testSwarm";

test("createTestSwarm connects 2 nodes", async () => {
  const testSwarm = createTestSwarm();
  const aHandler = jest.fn(() => ({ receive() {}, close() {} }));
  const bHandler = jest.fn(() => ({ receive() {}, close() {} }));
  await Promise.all([testSwarm.connect(bHandler), testSwarm.connect(aHandler)]);
  expect(aHandler.mock.calls.length).toBe(1);
  expect(bHandler.mock.calls.length).toBe(1);
});

test("createTestSwarm echoes between 2 nodes", async () => {
  const testSwarm = createTestSwarm();
  let aSendHello: any;
  const aReceive = jest.fn((data) => {});
  await Promise.all([
    testSwarm.connect(({ send }) => {
      aSendHello = () => send("hello");
      return {
        receive: aReceive,
        close() {},
      };
    }),
    testSwarm.connect(({ send }) => {
      return {
        receive(data) {
          send(data + "echo");
        },
        close() {},
      };
    }),
  ]);
  aSendHello();
  expect(aReceive.mock.calls.length).toBe(1);
  expect(aReceive.mock.calls[0][0]).toBe("helloecho");
});
