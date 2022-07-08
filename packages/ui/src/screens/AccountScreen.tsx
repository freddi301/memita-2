import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Settings } from "../api";

export function AccountScreen({ ...original }: Routes["Account"]) {
  const theme = useTheme();
  const [author, setAuthor] = React.useState(original.account ?? "");
  const [nickname, setNickname] = React.useState("");
  const [account, setAccount] = useAccount(original.account);
  React.useEffect(() => {
    if (account) {
      setNickname(account.nickname);
    }
  }, [account]);
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
            flex: 1,
          }}
        >
          Account
        </Text>
        <Pressable
          onPress={() => {
            setAccount({
              author,
              nickname,
              settings: account?.settings ?? defaultSettings,
            });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.textColor} />
        </Pressable>
      </View>
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label="Author"
          value={author}
          onChangeText={setAuthor}
          editable={original.account === undefined}
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

export function useAccount(account: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  const accountQuery = useQuery(["account", { author: account }], async () => {
    return await api.getAccount({ author: account ?? "" });
  });
  const addAccountMutation = useMutation(
    async ({
      author,
      nickname,
      settings,
    }: {
      author: string;
      nickname: string;
      settings: Settings;
    }) => {
      await api.addAccount({
        author,
        nickname,
        settings,
      });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );
  return [
    accountQuery.data ?? {
      author: account ?? "",
      nickname: "",
      settings: defaultSettings,
    },
    addAccountMutation.mutate,
  ] as const;
}

const defaultSettings: Settings = {
  theme: "dark",
  animations: "enabled",
};
