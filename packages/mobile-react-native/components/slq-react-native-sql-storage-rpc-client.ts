import {SqlDatabase} from '@memita-2/core';
import rn_bridge from 'rn-bridge';

export function createSqlReactNativeSqlStorageRpcClient(): SqlDatabase {
  const pendingRequests = new Map<
    number,
    {resolve(value: any): void; reject(error: any): void}
  >();
  rn_bridge.channel.on('message', (message: any) => {
    if (message.scope === 'sql') {
      const pendingRequest = pendingRequests.get(message.id);
      if (pendingRequest) {
        if (!message.isError) pendingRequest.resolve(message.result);
        else pendingRequest.reject(message.result);
        pendingRequests.delete(message.id);
      } else {
        console.warn('sql: unknown request id');
      }
    }
  });
  const doIt = (query: string, values: Array<string | number>) =>
    new Promise<any>((resolve, reject) => {
      const id = Math.random();
      pendingRequests.set(id, {resolve, reject});
      rn_bridge.channel.send({
        scope: 'sql',
        id,
        query: query,
        parameters: values,
      });
    });
  return {
    async run(query, values) {
      await doIt(query, values);
    },
    async all(query, values) {
      return await doIt(query, values);
    },
    async close() {},
  };
}
