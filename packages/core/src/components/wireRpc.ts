/** turns async methods into peer-to-peer remote procedure calls  */
export function wireRpc<
  RPC extends Record<string, (...args: any[]) => Promise<any>>
>({
  server,
  send,
}: {
  server: (client: RPC) => RPC;
  send(data: Buffer): void;
}) {
  type Message<Method extends keyof RPC> =
    | {
        type: "request";
        id: number;
        method: Method;
        arguments: Parameters<RPC[Method]>;
      }
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
  let nextRequestId = 0;
  const pendingRequests = new Map<
    number,
    { resolve(data: any): void; reject(error: any): void }
  >();
  const client = new Proxy(
    {},
    {
      get(target, propery, receiver) {
        return <Method extends keyof RPC>(...args: any[]) => {
          const message: Message<Method> = {
            type: "request",
            id: nextRequestId++,
            method: propery as Method,
            arguments: args as Parameters<RPC[Method]>,
          };
          send(Buffer.from(JSON.stringify(message)));
          return new Promise((resolve, reject) =>
            pendingRequests.set(message.id, { resolve, reject })
          );
        };
      },
    }
  ) as RPC;
  const serverInstance = server(client);
  const receive = <Method extends keyof RPC>(data: Buffer) => {
    const message = JSON.parse(String(data)) as Message<Method>;
    switch (message.type) {
      case "request": {
        serverInstance[message.method](...message.arguments).then(
          (data) =>
            send(
              Buffer.from(
                JSON.stringify({
                  type: "response",
                  id: message.id,
                  isError: false,
                  result: data,
                })
              )
            ),
          (error) =>
            send(
              Buffer.from(
                JSON.stringify({
                  type: "response",
                  id: message.id,
                  isError: true,
                  result: error,
                })
              )
            )
        );
        break;
      }
      case "response": {
        const pending = pendingRequests.get(message.id);
        if (!pending) throw new Error();
        if (!message.isError) pending.resolve(message.result);
        else pending.reject(message.result);
        break;
      }
    }
  };
  return {
    client,
    receive,
  };
}

/** given two servers it connects them, for testing purposes only */
export function rpcTieTheKnot<
  RPC extends Record<string, (...args: any[]) => Promise<any>>
>(serverA: (client: RPC) => RPC, serverB: (client: RPC) => RPC) {
  const a = wireRpc({
    server: serverA,
    send(data) {
      b.receive(data);
    },
  });
  const b = wireRpc({
    server: serverB,
    send(data) {
      a.receive(data);
    },
  });
  return [a.client, b.client] as const;
}
