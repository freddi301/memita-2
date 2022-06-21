import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "../components/FontAwesomeIcon";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Composition } from "../api";

export function CompositionScreen(props: Routes["Composition"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const addComunicationMutation = useMutation(
    async (comunication: Composition) => {
      await api.addComposition(comunication);
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [author, setAuthor] = React.useState(props.author ?? "");
  const [channel, setChannel] = React.useState(props.channel ?? "");
  const [recipient, setRecipient] = React.useState(props.recipient ?? "");
  const [quote, setQuote] = React.useState(props.quote ?? "");
  const [content, setContent] = React.useState(props.content ?? "");
  const add = () => {
    const version_timestamp = Date.now();
    const salt = props.salt ?? String(Math.random());
    addComunicationMutation.mutate({
      author,
      channel,
      recipient,
      quote,
      salt,
      content,
      version_timestamp,
    });
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
        }}
      >
        <BackButton />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: 16,
            borderBottomColor: "gray",
            flex: 1,
          }}
        >
          Compose
        </Text>
        <Pressable onPress={add} style={{ padding: 16 }}>
          <FontAwesomeIcon icon={"paper-plane"} color={theme.textColor} />
        </Pressable>
      </View>
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label="Author"
          value={author}
          onChangeText={setAuthor}
          editable={props.author === undefined}
        />
        {!(props.channel === "") && (
          <SimpleInput
            label="Channel"
            value={channel}
            onChangeText={setChannel}
            editable={props.channel === undefined}
          />
        )}
        {!(props.recipient === "") && (
          <SimpleInput
            label="Recipient"
            value={recipient}
            onChangeText={setRecipient}
            editable={props.recipient === undefined}
          />
        )}
        {!(props.quote === "") && (
          <SimpleInput
            label="Quote"
            value={quote}
            onChangeText={setQuote}
            editable={props.quote === undefined}
          />
        )}
        <SimpleInput
          label="Content"
          value={content}
          onChangeText={setContent}
        />
      </ScrollView>
    </View>
  );
}
