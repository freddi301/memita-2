import { AccountId } from "@memita-2/core";

export function formatAuthor(accountId: AccountId) {
  const readableString = AccountId.toReadableString(accountId);
  return `#${readableString.slice(0, 4)}...${readableString.slice(-4)}`;
}
