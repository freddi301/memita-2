import {
  createDuplexCbor,
  createRpcClient,
  createRpcServer,
} from "../src/components/rpc";
import { PassThrough } from "stream";
import duplexify from "duplexify";

test("rpc correctly calls", async () => {
  type RpcInterface = {
    double(x: number): Promise<number>;
  };
  const a = new PassThrough();
  const b = new PassThrough();
  const x = createDuplexCbor(duplexify(a, b));
  const y = createDuplexCbor(duplexify(b, a));
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

test("rpc client and server can share same connection", async () => {
  const rpcImplementation = {
    async double(x: number) {
      return x * 2;
    },
  };
  const a = new PassThrough();
  const b = new PassThrough();
  const x = createDuplexCbor(duplexify(a, b));
  const y = createDuplexCbor(duplexify(b, a));
  const xClient = createRpcClient<typeof rpcImplementation>(x);
  const xServer = createRpcServer(rpcImplementation, x);
  const yClient = createRpcClient<typeof rpcImplementation>(y);
  const yServer = createRpcServer(rpcImplementation, y);
  expect(await xClient.double(21)).toEqual(42);
  expect(await yClient.double(42)).toEqual(84);
});
