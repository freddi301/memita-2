import libsodium from "libsodium-wrappers";
import stringify from "fast-json-stable-stringify";
import { Readable } from "stream";
import { AccountId, AccountSecret, Brand, CryptoHash } from "./Api";

export async function cryptoHashValue(value: unknown): Promise<CryptoHash> {
  await libsodium.ready;
  const state = libsodium.crypto_generichash_init("", libsodium.crypto_generichash_KEYBYTES);
  libsodium.crypto_generichash_update(state, stringify(value));
  return CryptoHash.fromExchangeString(libsodium.crypto_generichash_final(state, libsodium.crypto_generichash_KEYBYTES, "hex"));
}

export async function cryptoHashStream(stream: Readable): Promise<CryptoHash> {
  await libsodium.ready;
  const state = libsodium.crypto_generichash_init("", libsodium.crypto_generichash_KEYBYTES);
  stream.on("data", (data) => libsodium.crypto_generichash_update(state, data));
  return new Promise<CryptoHash>((resolve, reject) => {
    stream.once("end", () =>
      resolve(CryptoHash.fromExchangeString(libsodium.crypto_generichash_final(state, libsodium.crypto_generichash_KEYBYTES, "hex")))
    );
    stream.once("error", (error) => reject(error));
  });
}

export async function cryptoCreateAsymmetricKeyPair(): Promise<[AccountId, AccountSecret]> {
  await libsodium.ready;
  const { publicKey, privateKey } = libsodium.crypto_sign_keypair("hex");
  return [AccountId.fromExchangeString(publicKey), AccountSecret.fromExchangeString(privateKey)];
}

// TODO better
export async function createNonce() {
  await libsodium.ready;
  const nonce = libsodium.randombytes_buf(libsodium.crypto_box_NONCEBYTES, "hex");
  return nonce;
}

// TODO better
export async function encrypt(unencrypted: unknown, nonce: string, secret: string, author: string) {
  await libsodium.ready;
  return libsodium.crypto_box_easy(
    libsodium.from_string(stringify(unencrypted)),
    libsodium.from_hex(nonce),
    libsodium.crypto_sign_ed25519_pk_to_curve25519(libsodium.from_hex(author)),
    libsodium.crypto_sign_ed25519_sk_to_curve25519(libsodium.from_hex(secret)),
    "uint8array"
  );
}

// TODO better
export async function decrypt(encrypted: Uint8Array, nonce: string, secret: string, author: string) {
  await libsodium.ready;
  return JSON.parse(
    libsodium.to_string(
      libsodium.crypto_box_open_easy(
        encrypted,
        libsodium.from_hex(nonce),
        libsodium.crypto_sign_ed25519_pk_to_curve25519(libsodium.from_hex(author)),
        libsodium.crypto_sign_ed25519_sk_to_curve25519(libsodium.from_hex(secret)),
        "uint8array"
      )
    )
  );
}

// TODO better
export async function sign(unsigned: unknown, secret: string) {
  await libsodium.ready;
  return libsodium.crypto_sign(libsodium.from_string(stringify(unsigned)), libsodium.from_hex(secret), "uint8array");
}

// TODO better
export async function verify(signed: Uint8Array, author: string) {
  await libsodium.ready;
  return JSON.parse(libsodium.to_string(libsodium.crypto_sign_open(signed, libsodium.from_hex(author), "uint8array")));
}
