import {
  createNonce,
  cryptoCreateAsymmetricKeyPair,
  cryptoHashFunction,
  decrypt,
  encrypt,
  sign,
  verify,
} from "../src/components/crypto";

test("crypto hash function", async () => {
  const hashA = cryptoHashFunction({ hello: "world" });
  const hashB = cryptoHashFunction({ hello: "world" });
  expect(hashA).toEqual(hashB);
});

test("encrypt decrypt", async () => {
  const unencrypted = { hello: "world" };
  const fred = await cryptoCreateAsymmetricKeyPair();
  const alice = await cryptoCreateAsymmetricKeyPair();
  const nonce = await createNonce();
  const encrypted = await encrypt(
    unencrypted,
    nonce,
    fred.privateKey,
    alice.publicKey
  );
  const decrypted = await decrypt(
    encrypted,
    nonce,
    alice.privateKey,
    fred.publicKey
  );
  expect(decrypted).toEqual(unencrypted);
});

test("sign verify", async () => {
  const unsigned = { hello: "world" };
  const fred = await cryptoCreateAsymmetricKeyPair();
  const signed = await sign(unsigned, fred.privateKey);
  const opened = await verify(signed, fred.publicKey);
  expect(opened).toEqual(unsigned);
});
