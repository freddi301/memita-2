import rn_bridge from 'rn-bridge';
import {createApi} from '@memita-2/core';

const api = createApi(null as any); // TODO

rn_bridge.channel.on('message', ({requestId, method, args}: any) => {
  (api as any)[method](...args).then(
    (result: any) => {
      rn_bridge.channel.send({requestId, isError: false, result});
    },
    (result: any) => {
      rn_bridge.channel.send({requestId, isError: true, result});
    },
  );
});
