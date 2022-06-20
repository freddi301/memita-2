import React from "react";
import { Pressable, Text, View } from "react-native";
import { useMutation } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Composition } from "../api";

export function ComposeScreen(props: Routes["Compose"]) {
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
  const [thread, setThread] = React.useState(props.thread ?? "");
  const [text, setText] = React.useState(props.text ?? "");
  const add = () => {
    const timestamp = Date.now();
    const salt = props.salt ?? String(Math.random());
    addComunicationMutation.mutate({
      author,
      channel: channel || null,
      recipient: recipient || null,
      thread: thread || null,
      salt,
      timestamp,
      text,
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
            paddingVertical: "16px",
            borderBottomColor: "gray",
            flex: 1,
          }}
        >
          Compose
        </Text>
        <Pressable onPress={add} style={{ padding: "16px" }}>
          <FontAwesomeIcon icon={"paper-plane"} color={theme.textColor} />
        </Pressable>
      </View>
      <SimpleInput
        label="Author"
        value={author}
        onChangeText={setAuthor}
        editable={props.author === undefined}
      />
      <SimpleInput
        label="Channel"
        value={channel}
        onChangeText={setChannel}
        editable={props.channel === undefined}
      />
      <SimpleInput
        label="Recipient"
        value={recipient}
        onChangeText={setRecipient}
        editable={props.recipient === undefined}
      />
      <SimpleInput
        label="Thread"
        value={thread}
        onChangeText={setThread}
        editable={props.thread === undefined}
      />
      <SimpleInput label="Text" value={text} onChangeText={setText} multiline />
    </View>
  );
}
