import { AccountId, AccountSecret, UiCommands } from "./Api";
import { cryptoCreateAsymmetricKeyPair } from "./crypto";
import { TablesDataGatewayInstance } from "./Tables";

export function createUiCommands({ tables }: { tables: TablesDataGatewayInstance }): UiCommands {
  return {
    async createAccount({ nickname, settings }) {
      const [accountId, accountSecret] = await cryptoCreateAsymmetricKeyPair();
      const account = AccountId.fromExchangeString(accountId);
      const secret = AccountSecret.fromExchangeString(accountSecret);
      await tables.table("accounts").set({ account, secret, nickname, settings: JSON.stringify(settings) });
      return { account };
    },
    async updateAccount({ account, nickname, settings }) {
      const existing = await tables.table("accounts").get({ account: AccountId.toExchangeString(account) });
      if (!existing) throw new Error();
      await tables
        .table("accounts")
        .set({ account: AccountId.toExchangeString(account), secret: existing.secret, nickname, settings: JSON.stringify(settings) });
    },
    async deleteAccount({ account }) {
      await tables.table("accounts").del({ account: AccountId.toExchangeString(account) });
    },
  };
}
