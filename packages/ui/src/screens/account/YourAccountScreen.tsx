import React from "react";
import { Pressable, Share, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes } from "../../routing";
import { useTheme } from "../../theme";
import { useApi } from "../../ui";
import { BackButton } from "../../components/BackButton";
import { SimpleInput } from "../../components/SimpleInput";
import { Account } from "../../api";
import { I18n } from "../../components/I18n";
import { Avatar } from "../../components/Avatar";

export function YourAccountScreen({ account }: Routes["YourAccount"]) {
  const theme = useTheme();
  const [nickname, setNickname] = React.useState("");
  const api = useApi();
  const queryClient = useQueryClient();
  const accountQuery = useQuery(
    ["account", { author: account }],
    async () => {
      return await api.getAccount({ author: account });
    },
    {
      onSuccess(account) {
        if (account) setNickname(account.nickname);
      },
    }
  );
  const addAccountMutation = useMutation(
    async (account: Account) => {
      await api.addAccount(account);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );

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
          <I18n en="Your account" it="Il tuo account" />
        </Text>
      </View>
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <Avatar size={96} />
      </View>
      <SimpleInput
        label={<I18n en="Nickname" it="Soprannome" />}
        value={nickname}
        onChangeText={setNickname}
        onBlur={() =>
          accountQuery.data &&
          addAccountMutation.mutate({ ...accountQuery.data, nickname })
        }
        description={
          <I18n
            en="An friendly name to help you remeber which account this is. It is visible only to you"
            it="Un nome mnemonico per aiutarti a ricordare di quale account si tratta. E visibile solo a te."
          />
        }
      />
      <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
        <Pressable
          style={{ paddingVertical: 8 }}
          onPress={() => {
            Share.share({
              message: `Add me to your memita contacts!\nMy name is: ${nickname}\n\n${account}`,
            });
          }}
        >
          <Text
            style={{
              color: theme.actionTextColor,
              textDecorationLine: "underline",
              textAlign: "center",
            }}
          >
            <I18n en="Send your contact" it="Invia il tuo contatto" />
          </Text>
        </Pressable>
        <Text style={{ color: theme.textColor, fontFamily: "monospace" }}>
          #{account}
        </Text>
        <Text style={{ color: theme.textSecondaryColor }}>
          <I18n
            en="Unique alphanumeric combinations that identifies your account. It is visible to others and is used to send you messages, like a phone number."
            it="Una combinazione alfanumerica unica che identifica il tuo account. E visibile agli altri e viene usata per inviarti i messaggi, come se fosse un numero di telefono."
          />
        </Text>
      </View>
    </View>
  );
}