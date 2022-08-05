import libsodium from "libsodium-wrappers";
import stringify from "fast-json-stable-stringify";
import { Readable } from "stream";

export async function cryptoHashFunction(value: unknown) {
  await libsodium.ready;
  const state = libsodium.crypto_generichash_init(
    "",
    libsodium.crypto_generichash_KEYBYTES
  );
  libsodium.crypto_generichash_update(state, stringify(value));
  return libsodium.crypto_generichash_final(
    state,
    libsodium.crypto_generichash_KEYBYTES,
    "hex"
  );
}

export async function cryptoHashStream(stream: Readable) {
  await libsodium.ready;
  const state = libsodium.crypto_generichash_init(
    "",
    libsodium.crypto_generichash_KEYBYTES
  );
  stream.on("data", (data) => libsodium.crypto_generichash_update(state, data));
  return new Promise<string>((resolve, reject) => {
    stream.once("end", () =>
      resolve(
        libsodium.crypto_generichash_final(
          state,
          libsodium.crypto_generichash_KEYBYTES,
          "hex"
        )
      )
    );
    stream.once("error", (error) => reject(error));
  });
}

export async function cryptoCreateAsymmetricKeyPair() {
  await libsodium.ready;
  return libsodium.crypto_box_keypair("hex");
}

export async function createNonce() {
  await libsodium.ready;
  const nonce = libsodium.randombytes_buf(
    libsodium.crypto_box_NONCEBYTES,
    "hex"
  );
  return nonce;
}

export async function encrypt(
  unencrypted: unknown,
  nonce: string,
  secret: string,
  author: string
) {
  await libsodium.ready;
  return libsodium.crypto_box_easy(
    libsodium.from_string(stringify(unencrypted)),
    libsodium.from_hex(nonce),
    libsodium.from_hex(author),
    libsodium.from_hex(secret),
    "uint8array"
  );
}

export async function decrypt(
  encrypted: Uint8Array,
  nonce: string,
  secret: string,
  author: string
) {
  await libsodium.ready;
  return JSON.parse(
    libsodium.to_string(
      libsodium.crypto_box_open_easy(
        encrypted,
        libsodium.from_hex(nonce),
        libsodium.from_hex(author),
        libsodium.from_hex(secret),
        "uint8array"
      )
    )
  );
}
