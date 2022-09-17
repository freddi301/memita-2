export function deferable<V>() {
  let resolve: (value: V) => void = undefined as any;
  let reject: (error: any) => void = undefined as any;
  const promise = new Promise((res, rej) => {
    resolve = (data) => {
      res(data);
      obj.status = "resolved";
    };
    reject = (error) => {
      rej(error);
      obj.status = "rejected";
    };
  });
  const obj = {
    promise,
    resolve,
    reject,
    status: "pending" as "pending" | "resolved" | "rejected",
  };
  return obj;
}
