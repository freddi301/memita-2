import { Account } from "@memita-2/ui";
import { cryptoCreateAsymmetricKeyPair } from "../../src/components/crypto";
import { basicSettings } from "./basic-settings";

export async function createTestAccount(
  nickname = "",
  settings = basicSettings
): Promise<Account> {
  const { privateKey, publicKey } = await cryptoCreateAsymmetricKeyPair();
  return {
    nickname,
    author: publicKey,
    secret: privateKey,
    settings,
  };
}
