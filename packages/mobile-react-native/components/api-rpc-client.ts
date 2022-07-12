import nodejs from 'nodejs-mobile-react-native';
import {Api} from '@memita-2/ui';

export function createApiRpcClient() {
  const pendingRequests = new Map<
    number,
    {resolve(value: any): void; reject(error: any): void}
  >();
  nodejs.channel.addListener('message', (message: any) => {
    if (message.scope === 'api') {
      const pendingRequest = pendingRequests.get(message.id);
      if (pendingRequest) {
        if (!message.isError) pendingRequest.resolve(message.result);
        else pendingRequest.reject(message.result);
        pendingRequests.delete(message.id);
      } else {
        console.warn('api: unknown request id');
      }
    }
  });
  return new Proxy(
    {},
    {
      get(target, method) {
        return (...parameters: any[]) =>
          new Promise((resolve, reject) => {
            const id = Math.random();
            pendingRequests.set(id, {resolve, reject});
            nodejs.channel.send({scope: 'api', id, method, parameters});
          });
      },
    },
  ) as Api;
}
