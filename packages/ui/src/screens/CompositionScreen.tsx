import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Composition } from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { HorizontalLoader } from "../components/HorizontalLoader";

export function CompositionScreen({
  account,
  ...original
}: Routes["Composition"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const compositionQuery = useQuery(
    [
      "composition",
      {
        account,
        author: original.author,
        channel: original.channel,
        recipient: original.recipient,
        quote: original.quote,
        salt: original.salt,
      },
    ],
    async () => {
      return await api.getComposition({
        account,
        author: original.author ?? "",
        channel: original.channel ?? "",
        recipient: original.recipient ?? "",
        quote: original.quote ?? "",
        salt: original.salt ?? "",
      });
    }
  );
  const addCompositionMutation = useMutation(
    async (comunication: Composition) => {
      await api.addComposition(comunication);
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [channel, setChannel] = React.useState(original.channel ?? "");
  const [recipient, setRecipient] = React.useState(original.recipient ?? "");
  const [quote, setQuote] = React.useState(original.quote ?? "");
  const [content, setContent] = React.useState("");
  React.useEffect(() => {
    if (compositionQuery.data) {
      setContent(compositionQuery.data.content);
    }
  }, [compositionQuery.data]);
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
          Composition
        </Text>
        {(account === original.author || original.author === undefined) && (
          <Pressable
            onPress={() => {
              const version_timestamp = Date.now();
              const salt = original.salt ?? String(Math.random());
              addCompositionMutation.mutate({
                author: account,
                channel,
                recipient,
                quote,
                salt,
                content,
                version_timestamp,
              });
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"paper-plane"} color={theme.textColor} />
          </Pressable>
        )}
      </View>
      <HorizontalLoader isLoading={compositionQuery.isFetching} />
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label="Author"
          value={original.author ?? account}
          onChangeText={() => undefined}
          editable={false}
        />
        {!(original.channel === "") && (
          <SimpleInput
            label="Channel"
            value={channel}
            onChangeText={setChannel}
            editable={original.channel === undefined}
          />
        )}
        {!(original.recipient === "") && (
          <SimpleInput
            label="Recipient"
            value={recipient}
            onChangeText={setRecipient}
            editable={original.recipient === undefined}
          />
        )}
        {!(original.quote === "") && (
          <SimpleInput
            label="Quote"
            value={quote}
            onChangeText={setQuote}
            editable={original.quote === undefined}
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
