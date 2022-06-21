import { createApi } from "../src";
import { createSql } from "./sql.js";

test("authors aggregation", async () => {
  const api = createApi(await createSql());
  expect(await api.getAuthors({})).toEqual([]);
  const authorA = {
    author: "Frederik",
    nickname: "Fred",
    deleted: false,
    version_timestamp: 1,
  };
  await api.addAuthor(authorA);
  expect(await api.getAuthors({})).toEqual([authorA]);
  const authorB = {
    author: "Frederik",
    nickname: "Macco",
    deleted: true,
    version_timestamp: 2,
  };
  await api.addAuthor(authorB);
  expect(await api.getAuthors({ deleted: false })).toEqual([]);
  expect(await api.getAuthors({ nickname: "Macco", deleted: true })).toEqual([
    authorB,
  ]);
  expect(await api.getAuthors({ nickname: "Fred", deleted: true })).toEqual([]);
});
