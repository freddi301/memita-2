import { createRpcClient, createRpcServer } from "../src/components/rpc";
import { PassThrough } from "stream";
import duplexify from "duplexify";

test("rpc correctly calls", async () => {
  type RpcInterface = {
    double(x: number): Promise<number>;
  };
  const a = new PassThrough();
  const b = new PassThrough();
  const x = duplexify(a, b);
  const y = duplexify(b, a);
  const client = createRpcClient<RpcInterface>(x);
  createRpcServer<RpcInterface>(
    {
      async double(x) {
        return x * 2;
      },
    },
    y
  );
  expect(await client.double(21)).toEqual(42);
  expect(await client.double(42)).toEqual(84);
});
