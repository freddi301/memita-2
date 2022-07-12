export function formatAuthor(author: string) {
  return `#${author.slice(0, 4)}...${author.slice(-4)}`;
}
