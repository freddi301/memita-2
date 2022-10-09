import { CryptoHash, SynchronizationCommand, SynchronizationCommands } from "./Api";
import { cryptoHashValue } from "./crypto";

export function synchronizationCommandCryptoHash(command: SynchronizationCommand): Promise<CryptoHash> {
  return cryptoHashValue(command);
}

export const synchronizationCommandsCryptoHash: {
  [K in keyof SynchronizationCommands]: (params: Parameters<SynchronizationCommands[K]>[0]) => Promise<CryptoHash>;
} = new Proxy(
  {},
  {
    get(target, property, receiver) {
      return (args: any) => synchronizationCommandCryptoHash({ type: property, ...args });
    },
  }
) as any;
