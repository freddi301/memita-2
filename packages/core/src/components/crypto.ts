import libsodium from "libsodium-wrappers";

export async function cryptoHashFunction(value: unknown) {
  await libsodium.ready;
  const state = libsodium.crypto_generichash_init(
    "",
    libsodium.crypto_generichash_KEYBYTES
  );
  libsodium.crypto_generichash_update(state, JSON.stringify(value));
  return libsodium.crypto_generichash_final(
    state,
    libsodium.crypto_generichash_KEYBYTES,
    "hex"
  );
}

export async function cryptoCreateAsymmetricKeyPair() {
  await libsodium.ready;
  return libsodium.crypto_box_keypair("hex");
}
