import { createApi } from "../src/api";
import { createSql } from "./sql";
import { sync } from "../src/sync";

test("sync single contact", async () => {
  const aSql = createSql();
  const aApi = createApi(aSql);
  const bSql = createSql();
  const bApi = createApi(bSql);
  const contactA = {
    account: "fred",
    author: "ali",
    label: "",
    nickname: "Alice",
    version_timestamp: 1,
  };
  await aApi.addContact(contactA);
  sync(aSql, aApi);
  sync(bSql, bApi);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(await bApi.getContacts({ account: "fred" })).toEqual(
    await aApi.getContacts({ account: "fred" })
  );
});
