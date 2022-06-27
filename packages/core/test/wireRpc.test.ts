import { rpcTieTheKnot } from "../src/components/wireRpc";

test("wireRpc correctly calls", async () => {
  type RPCInterface = {
    double(x: number): Promise<number>;
  };
  const server = ({}: RPCInterface): RPCInterface => ({
    async double(x: number) {
      return x * 2;
    },
  });
  const [a, b] = rpcTieTheKnot(server, server);
  expect(await a.double(2)).toEqual(4);
});
