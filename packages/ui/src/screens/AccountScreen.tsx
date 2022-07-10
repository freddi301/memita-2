import React from "react";
import {
  Appearance,
  Pressable,
  ScrollView,
  Text,
  View,
  NativeModules,
  Platform,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Settings } from "../api";
import { I18n } from "../components/I18n";

export function AccountScreen({ ...original }: Routes["Account"]) {
  const routing = useRouting();
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
          <I18n en="Account" it="Account" />
        </Text>
        <Pressable
          onPress={() => {
            setAccount(
              {
                author,
                nickname,
                settings: account?.settings ?? defaultSettings,
              },
              {
                onSuccess() {
                  routing.back();
                },
              }
            );
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.actionTextColor} />
        </Pressable>
      </View>
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label={<I18n en="Author" it="Autore" />}
          value={author}
          onChangeText={setAuthor}
          editable={original.account === undefined}
          description={
            <I18n
              en="A unique combinations of letters that identifies your account"
              it="Una combinazione unica di lettere che identificano il tuo account"
            />
          }
        />
        <SimpleInput
          label={<I18n en="Nickname" it="Soprannome" />}
          value={nickname}
          onChangeText={setNickname}
          description={
            <I18n
              en="An optional friendly name to help you remeber which account this is. Nobody else see it"
              it="Un nome legibile non obligatorio per ricordarti di quale account si tratta. Nessun altro lo vede"
            />
          }
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
  const defaultAccount = React.useMemo(() => {
    return {
      author: account ?? "",
      nickname: "",
      settings: defaultSettings,
    };
  }, [account]);
  return [
    accountQuery.data ?? defaultAccount,
    addAccountMutation.mutate,
  ] as const;
}

const defaultSettings: Settings = {
  language: getSystemLocale(),
  theme: Appearance.getColorScheme() ?? "dark",
  animations: "enabled",
};

function getSystemLocale() {
  switch (Platform.OS) {
    case "android":
      return NativeModules.I18nManager.localeIdentifier.slice(0, 2);
    case "ios":
      return (
        NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      );
    case "web":
      return (navigator.languages[0] || navigator.language).slice(0, 2);
  }
}
