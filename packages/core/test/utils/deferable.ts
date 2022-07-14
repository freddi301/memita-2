export function deferable<V>() {
  let resolve: (value: V) => void = undefined as any;
  let reject: (error: any) => void = undefined as any;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
