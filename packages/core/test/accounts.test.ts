import { createApi } from "../src";
import { createSql } from "./sqlite/sql.js";

test("account aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getAccounts({})).toEqual([]);
  const accountA = {
    author: "Frederik",
    nickname: "Fred",
    version_timestamp: 1,
  };
  await api.addAccount(accountA);
  expect(await api.getAccounts({})).toEqual([accountA]);
  const accountB = {
    author: "Frederik",
    nickname: "Macco",
    version_timestamp: 2,
  };
  await api.addAccount(accountB);
  expect(await api.getAccounts({})).toEqual([accountB]);
});
