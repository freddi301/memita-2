import React from "react";
import { Text, View } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { Attachment, PublicMessage } from "../api";
import { BackButton } from "../components/BackButton";
import { ComposeMessage } from "../components/ComposeMessage";
import { I18n } from "../components/I18n";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";

export function ComposePublicMessageScreen({
  account,
  ...original
}: Routes["ComposePublicMessage"]) {
  const theme = useTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const routing = useRouting();
  const [content, setContent] = React.useState("");
  const [attachments, setAttachments] = React.useState<Array<Attachment>>([]);
  const addPublicMessageMutation = useMutation(
    async (message: PublicMessage) => {
      await api.addPublicMessage(message);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["public-messages"]);
        routing.back();
      },
    }
  );
  const send = () => {
    const version_timestamp = Date.now();
    const salt = String(Math.random());
    addPublicMessageMutation.mutate({
      author: account,
      quote: "",
      salt,
      content,
      attachments,
      version_timestamp,
    });
  };
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
          <I18n en="Write a Post" it="Scrivi un Post" />
        </Text>
      </View>
      <View
        style={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <ComposeMessage
          content={content}
          onContentChange={setContent}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          onSend={send}
        />
      </View>
    </View>
  );
}
