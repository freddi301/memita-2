import { Duplex } from "stream";

// TODO validate deserialized message
// TODO ensure streams are in object mode and emits Buffers

type RpcShape = Record<string, (...args: any[]) => Promise<any>>;

type RpcRequest<RPC extends RpcShape, Method extends keyof RPC> = {
  type: "request";
  id: number;
  method: Method;
  parameters: Parameters<RPC[Method]>;
};

type RpcResponse<RPC extends RpcShape, Method extends keyof RPC> =
  | {
      type: "response";
      id: number;
      method: Method;
      isError: false;
      result: Awaited<ReturnType<RPC[Method]>>;
    }
  | {
      type: "response";
      id: number;
      method: Method;
      isError: true;
      result: unknown;
    };

function serialize(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value));
}

function deserialize(data: Buffer): unknown {
  return JSON.parse(data.toString());
}

export function createRpcClient<RPC extends RpcShape>(stream: Duplex) {
  let nextRequestId = 0;
  const pendingRequests = new Map<
    number,
    { resolve(data: any): void; reject(error: any): void }
  >();
  stream.on("data", (data) => {
    const message = deserialize(data) as RpcResponse<RPC, keyof RPC>;
    const pendingRequest = pendingRequests.get(message.id);
    if (message.type === "response" && pendingRequest) {
      if (message.isError) pendingRequest.reject(new Error("rpc error "));
      else pendingRequest.resolve(message.result);
      pendingRequests.delete(message.id);
    }
  });
  stream.once("end", () => {
    for (const [, { reject }] of pendingRequests) {
      reject(new Error("stream closed"));
    }
  });
  return new Proxy(
    {},
    {
      get(target, propery, receiver) {
        return async <Method extends keyof RPC>(
          ...parameters: Parameters<RPC[Method]>
        ) => {
          const method = propery as Method;
          const id = nextRequestId++;
          const message: RpcRequest<RPC, Method> = {
            type: "request",
            id,
            method,
            parameters,
          };
          await new Promise((resolve, reject) => {
            if (stream.writable && !stream.destroyed) {
              stream.write(serialize(message), (error) => {
                if (error) reject(error);
                else resolve(undefined);
              });
            } else {
              reject(new Error("stream closed"));
            }
          });
          return new Promise((resolve, reject) =>
            pendingRequests.set(message.id, { resolve, reject })
          );
        };
      },
    }
  ) as RPC;
}

export function createRpcServer<RPC extends RpcShape>(
  server: RPC,
  stream: Duplex
) {
  stream.on("data", (data) => {
    (async <Method extends keyof RPC>(message: RpcRequest<RPC, Method>) => {
      if (message.type !== "request") return;
      try {
        const result = await server[message.method](...message.parameters);
        const response: RpcResponse<RPC, Method> = {
          type: "response",
          id: message.id,
          method: message.method,
          isError: false,
          result,
        };
        await new Promise((resolve, reject) =>
          stream.write(serialize(response), (error) => {
            if (error) reject(error);
            else resolve(undefined);
          })
        );
      } catch (error) {
        const response: RpcResponse<RPC, Method> = {
          type: "response",
          id: message.id,
          method: message.method,
          isError: true,
          result: error,
        };
        await new Promise((resolve, reject) => {
          if (stream.writable && !stream.destroyed) {
            stream.write(serialize(response), (error) => {
              if (error) reject(error);
              else resolve(undefined);
            });
          } else {
            reject(new Error("stream closed"));
          }
        });
      }
    })(deserialize(data) as any);
  });
}
