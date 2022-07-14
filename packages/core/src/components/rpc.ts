import { Duplex, pipeline } from "stream";
import cbor from "cbor";
import duplexify from "duplexify";

// TODO validate deserialized message

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

export function createRpcClient<RPC extends RpcShape>(stream: Duplex) {
  // if (!stream.readableObjectMode)
  //   throw new Error("stream must be readable object mode");
  // if (!stream.writableObjectMode)
  //   throw new Error("stream must be writable object mode");
  let nextRequestId = 0;
  const pendingRequests = new Map<
    number,
    { resolve(data: any): void; reject(error: any): void }
  >();
  stream.on("data", (data) => {
    const message = data as RpcResponse<RPC, keyof RPC>;
    const pendingRequest = pendingRequests.get(message.id);
    if (message.type === "response" && pendingRequest) {
      if (message.isError) pendingRequest.reject(new Error("rpc error"));
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
              stream.write(message, (error) => {
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
  // if (!stream.readableObjectMode)
  //   throw new Error("stream must be readable object mode");
  // if (!stream.writableObjectMode)
  //   throw new Error("stream must be writable object mode");
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
          stream.write(response, (error) => {
            if (error) reject(error);
            else resolve(undefined);
          })
        );
      } catch (error) {
        console.error(error);
        const response: RpcResponse<RPC, Method> = {
          type: "response",
          id: message.id,
          method: message.method,
          isError: true,
          result: error,
        };
        await new Promise((resolve, reject) => {
          if (stream.writable && !stream.destroyed) {
            stream.write(response, (error) => {
              if (error) reject(error);
              else resolve(undefined);
            });
          } else {
            reject(new Error("stream closed"));
          }
        });
      }
    })(data as any);
  });
}

export function createDuplexCbor(stream: Duplex) {
  if (stream.readableObjectMode)
    throw new Error("stream must be readable buffer mode");
  if (stream.writableObjectMode)
    throw new Error("stream must be writable buffer mode");
  const encoder = new cbor.Encoder();
  const decoder = new cbor.Decoder();
  pipeline(encoder, stream, () => {});
  pipeline(stream, decoder, () => {});
  const cborStream = duplexify(encoder, decoder, {
    objectMode: true,
    writableObjectMode: true,
    readableObjectMode: true,
  });
  return cborStream;
}
