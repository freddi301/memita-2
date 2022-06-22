import { createApi } from "../src";
import { createSql } from "./sqlite/sql.js";

test("authors aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getAuthors({})).toEqual([]);
  const authorA = {
    author: "Frederik",
    nickname: "Fred",
    label: "",
    version_timestamp: 1,
  };
  await api.addAuthor(authorA);
  expect(await api.getAuthors({})).toEqual([authorA]);
  const authorB = {
    author: "Frederik",
    nickname: "Macco",
    label: "delted",
    version_timestamp: 2,
  };
  await api.addAuthor(authorB);
  expect(await api.getAuthors({ label: "" })).toEqual([]);
  expect(await api.getAuthors({ nickname: "Macco", label: "delted" })).toEqual([
    authorB,
  ]);
  expect(await api.getAuthors({ nickname: "Fred", label: "delted" })).toEqual(
    []
  );
});
