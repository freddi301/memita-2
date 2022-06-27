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
  type Message =
    | { type: "request"; id: number; method: string; arguments: any[] }
    | { type: "response"; id: number; isError: boolean; result: any };
  let nextRequestId = 0;
  const pendingRequests = new Map<
    number,
    { resolve(data: any): void; reject(error: any): void }
  >();
  const client = new Proxy(
    {},
    {
      get(target, propery, receiver) {
        return (...args: any[]) => {
          const message: Message = {
            type: "request",
            id: nextRequestId++,
            method: propery as string,
            arguments: args,
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
  const receive = (data: Buffer) => {
    const message = JSON.parse(String(data)) as Message;
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
