import { validate } from "@deepkit/type";

test("deepkit features", () => {
  type User = { id: number; name: string };
  expect(validate<User>({ id: 1, name: "fred" })).toEqual([]);
  type Api = {
    inc(x: number): number;
    dup(x: string): string;
  };
  type Request = {
    [Method in keyof Api]: {
      method: Method;
      arguments: Parameters<Api[Method]>;
    };
  }[keyof Api];
  type Response = {
    [Method in keyof Api]: {
      method: Method;
      result: ReturnType<Api[Method]>;
    };
  }[keyof Api];
  expect(
    validate<Request>({ method: "inc", arguments: [4] } as Request)
  ).toEqual([]);
  expect(
    validate<Request>({ method: "dup", arguments: [""] } as Request)
  ).toEqual([]);
  expect(validate<Request>({ method: "inc", arguments: [""] })).not.toEqual([]);
  expect(validate<Request>({ method: "unc", arguments: [""] })).not.toEqual([]);
  expect(validate<Response>({ method: "inc", result: 4 } as Response)).toEqual(
    []
  );
  expect(validate<Request>({ method: "dup", result: "" } as Response)).toEqual(
    []
  );
  expect(validate<Response>({ method: "inc", result: "" })).not.toEqual([]);
  expect(validate<Request>({ method: "enc", result: "" })).not.toEqual([]);
});
