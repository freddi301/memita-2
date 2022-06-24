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

export function AccountScreen({ ...original }: Routes["Account"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const accountQuery = useQuery(
    ["account", { author: original.author ?? "" }],
    async () => {
      return await api.getAccount({ author: "" });
    }
  );
  const addAccountMutation = useMutation(
    async ({ author, nickname }: { author: string; nickname: string }) => {
      const version_timestamp = Date.now();
      await api.addAccount({
        author,
        nickname,
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [author, setAuthor] = React.useState(original.author ?? "");
  const [nickname, setNickname] = React.useState("");
  React.useEffect(() => {
    if (accountQuery.data) {
      setNickname(accountQuery.data.nickname);
    }
  }, [accountQuery.data]);
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          height: theme.headerHeight,
          alignItems: "center",
        }}
      >
        <BackButton />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            borderBottomColor: "gray",
            flex: 1,
          }}
        >
          Account
        </Text>
        <Pressable
          onPress={() => {
            addAccountMutation.mutate({ author, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.textColor} />
        </Pressable>
      </View>
      <HorizontalLoader isLoading={accountQuery.isFetching} />
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label="Author"
          value={author}
          onChangeText={setAuthor}
          editable={original.author === undefined}
        />
        <SimpleInput
          label="Nickname"
          value={nickname}
          onChangeText={setNickname}
        />
      </ScrollView>
    </View>
  );
}
