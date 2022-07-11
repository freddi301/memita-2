import {Sql} from '@memita-2/core';
import rn_bridge from 'rn-bridge';

export function createSqlReactNativeSqlStorageRpcClient(): Sql {
  const pendingRequests = new Map<
    number,
    {resolve(value: any): void; reject(error: any): void}
  >();
  rn_bridge.channel.on('message', (message: any) => {
    if (message.scope === 'sql') {
      const pendingRequest = pendingRequests.get(message.id);
      if (!pendingRequest) throw new Error('unknown request id');
      if (!message.isError) pendingRequest.resolve(message.result);
      else pendingRequest.reject(message.result);
      pendingRequests.delete(message.id);
    }
  });
  const sql = (strings: TemplateStringsArray, ...values: any[]) => {
    const doIt = () =>
      new Promise<any>((resolve, reject) => {
        const id = Math.random();
        pendingRequests.set(id, {resolve, reject});
        rn_bridge.channel.send({
          scope: 'sql',
          id,
          query: strings.join('?'),
          parameters: values,
        });
      });
    return {run: doIt, all: doIt};
  };
  sql.close = async () => {};
  return sql;
}
