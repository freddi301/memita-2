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
          <I18n en="Contact" it="Contatto" />
        </Text>
        {original.author && (
          <Pressable
            onPress={() => {
              deleteContactMutation.mutate(author);
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"trash"} color={theme.actionTextColor} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            addContactMutation.mutate({ author, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.actionTextColor} />
        </Pressable>
      </View>
      <HorizontalLoader isLoading={contactQuery.isFetching} />
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label={<I18n en="Author" it="Autore" />}
          value={author}
          onChangeText={setAuthor}
          editable={original.author === undefined}
          description={
            <I18n
              en="A unique combinations of letters that identifies your contact's account"
              it="Una combinazione unica di lettere che identificano l'account del tuo contatto"
            />
          }
        />
        <SimpleInput
          label={<I18n en="Nickname" it="Soprannome" />}
          value={nickname}
          onChangeText={setNickname}
          description={
            <I18n
              en="An optional friendly name to help you remeber the person who owns this account. Nobody else see it"
              it="Un nome legibile non obligatorio per ricordarti a quale persona appertiene questo account. Nessun altro lo vede"
            />
          }
        />
      </ScrollView>
    </View>
  );
}
