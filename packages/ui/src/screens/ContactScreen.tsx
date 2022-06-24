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

export function ContactScreen({ account, ...original }: Routes["Contact"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const contactQuery = useQuery(
    ["contact", { account, author: original.author }],
    async () => {
      return await api.getContact({
        account,
        author: original.author ?? "",
      });
    }
  );
  const addContactMutation = useMutation(
    async ({ author, nickname }: { author: string; nickname: string }) => {
      const version_timestamp = Date.now();
      await api.addContact({
        account,
        author,
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
  const deleteContactMutation = useMutation(
    async (author: string) => {
      const version_timestamp = Date.now();
      await api.addContact({
        account,
        author,
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
  const [author, setAuthor] = React.useState(original.author ?? "");
  const [nickname, setNickname] = React.useState("");
  React.useEffect(() => {
    if (contactQuery.data) {
      setNickname(contactQuery.data.nickname);
    }
  }, [contactQuery.data]);

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
          Contact
        </Text>
        {original.author && (
          <Pressable
            onPress={() => {
              deleteContactMutation.mutate(author);
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"trash"} color={theme.textColor} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            addContactMutation.mutate({ author, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.textColor} />
        </Pressable>
      </View>
      <HorizontalLoader isLoading={contactQuery.isFetching} />
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
