import Hyperswarm from "hyperswarm";

export const api = {
  addBlock,
  getBlocks,
};

export type API = typeof api;

const blocks = new Set<string>();

type Listener = (block: string) => void;

const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  for (const block of blocks) {
    listener(block);
  }
  listeners.add(listener);
}

function unsubscribe(listener: Listener) {
  listeners.delete(listener);
}

async function addBlock(text: string) {
  if (blocks.has(text)) return;
  blocks.add(text);
  for (const listener of listeners) {
    listener(text);
  }
}

async function getBlocks() {
  return Array.from(blocks);
}

const topic = Buffer.alloc(32).fill("memita 2");
const swarm = new Hyperswarm();
swarm.join(topic, { server: true, client: true });
swarm.on("connection", (connection, info) => {
  connection.on("data", (data) => {
    addBlock(String(data));
  });
  const listener: Listener = (block) => {
    connection.write(block);
  };
  subscribe(listener);
  connection.on("close", () => {
    unsubscribe(listener);
  });
  connection.on("error", () => {
    unsubscribe(listener);
  });
});
