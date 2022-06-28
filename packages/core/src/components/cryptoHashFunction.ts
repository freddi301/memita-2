import libsodium from "libsodium-wrappers";

export function cryptoHashFunction(value: unknown) {
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
