import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";

export function ChannelScreen({ account, ...original }: Routes["Channel"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const channelQuery = useQuery(
    ["channel", { account, channel: original.channel }],
    async () => {
      return await api.getChannel({
        account,
        channel: original.channel ?? "",
      });
    }
  );
  const addChannelMutation = useMutation(
    async ({ channel, nickname }: { channel: string; nickname: string }) => {
      const version_timestamp = Date.now();
      await api.addChannel({
        account,
        channel,
        nickname,
        label: "",
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const deleteChannelMutation = useMutation(
    async (channel: string) => {
      const version_timestamp = Date.now();
      await api.addChannel({
        account,
        channel,
        nickname,
        label: "deleted",
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [channel, setChannel] = React.useState(original.channel ?? "");
  const [nickname, setNickname] = React.useState("");
  React.useEffect(() => {
    if (channelQuery.data) {
      setNickname(channelQuery.data.nickname);
    }
  }, [channelQuery.data]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          height: theme.headerHeight,
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
        }}
      >
        <BackButton />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            flex: 1,
          }}
        >
          <I18n en="Channel" it="Canale" />
        </Text>
        {original.channel && (
          <Pressable
            onPress={() => {
              deleteChannelMutation.mutate(channel);
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"trash"} color={theme.actionTextColor} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            addChannelMutation.mutate({ channel, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.actionTextColor} />
        </Pressable>
      </View>
      <HorizontalLoader isLoading={channelQuery.isFetching} />
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label={<I18n en="Channel" it="Canale" />}
          value={channel}
          onChangeText={setChannel}
          editable={original.channel === undefined}
        />
        <SimpleInput
          label={<I18n en="Nickname" it="Soprannome" />}
          value={nickname}
          onChangeText={setNickname}
        />
      </ScrollView>
    </View>
  );
}
