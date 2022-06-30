import { createApi } from "../src/api";
import { createTestSwarm } from "../src/components/swarm/testSwarm";
import { createSql } from "./sql";

test("channel aggregation", async () => {
  const api = createApi(createSql(), createTestSwarm());
  expect(await api.getChannels({ account: "fred" })).toEqual([]);
  const channelA = {
    account: "fred",
    channel: "home",
    nickname: "Fred",
    label: "",
    version_timestamp: 1,
  };
  await api.addChannel(channelA);
  expect(await api.getChannels({ account: "fred" })).toEqual([channelA]);
  const channelB = {
    account: "fred",
    channel: "home",
    nickname: "work",
    label: "",
    version_timestamp: 2,
  };
  await api.addChannel(channelB);
  expect(await api.getChannels({ account: "fred" })).toEqual([channelB]);
});
