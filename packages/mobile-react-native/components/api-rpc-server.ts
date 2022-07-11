import rn_bridge from 'rn-bridge';
import {Api} from '@memita-2/ui';

export function createApiRpcServer(apiPromise: Promise<Api>) {
  rn_bridge.channel.on('message', ({scope, id, method, parameters}: any) => {
    if (scope === 'api') {
      apiPromise.then(api =>
        (api as any)[method](...parameters).then(
          (result: any) => {
            rn_bridge.channel.send({scope: 'api', id, isError: false, result});
          },
          (result: any) => {
            rn_bridge.channel.send({scope: 'api', id, isError: true, result});
          },
        ),
      );
    }
  });
}
