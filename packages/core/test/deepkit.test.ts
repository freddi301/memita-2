import { validate } from "@deepkit/type";

test("deepkit features", () => {
  type User = { id: number; name: string };
  expect(validate<User>({ id: 1, name: "fred" })).toEqual([]);
});
