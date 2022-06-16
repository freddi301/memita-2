import Hyperswarm from "hyperswarm";
import { Api } from "@memita-2/ui";

export const api: Api = {
  async getBlocks() {
    return Array.from(blocks);
  },
  async addBlock(text) {
    if (blocks.has(text)) return;
    blocks.add(text);
    for (const listener of listeners) {
      listener(text);
    }
  },
};

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

const topic = Buffer.alloc(32).fill("memita-2");
const swarm = new Hyperswarm();
swarm.join(topic, { server: true, client: true });
swarm.on("connection", (connection, info) => {
  connection.on("data", (data) => {
    api.addBlock(String(data));
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
