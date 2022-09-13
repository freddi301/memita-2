import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import prettyBytes from "pretty-bytes";
import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Attachment } from "../api";
import { useTheme } from "../theme";
import { OverridesContext, useApi } from "../ui";

type ComposeMessageProps = {
  content: string;
  onContentChange(content: string): void;
  attachments: Array<Attachment>;
  onAttachmentsChange(attachments: Array<Attachment>): void;
  onSend(): void;
};
export function ComposeMessage({
  content,
  onContentChange,
  attachments,
  onAttachmentsChange,
  onSend,
}: ComposeMessageProps) {
  const theme = useTheme();
  const { pickFiles } = React.useContext(OverridesContext);
  const api = useApi();
  return (
    <React.Fragment>
      {attachments.length > 0 && (
        <View
          style={{
            height: 48,
          }}
        >
          <ScrollView horizontal={true} style={{ flexDirection: "row" }}>
            {attachments.map((attachment, index, array) => {
              return (
                <Pressable
                  key={index}
                  style={{
                    flexDirection: "row",
                    borderLeftWidth: index === 0 ? 1 : 0,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderColor: theme.borderColor,
                    backgroundColor: theme.backgroundColorSecondary,
                  }}
                  onPress={() => {
                    onAttachmentsChange([
                      ...attachments.slice(0, index),
                      ...attachments.slice(index + 1),
                    ]);
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: 48,
                      marginLeft: 16,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={"paperclip"}
                      color={theme.textSecondaryColor}
                    />
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: theme.textColor }}>
                      {attachment.name}
                    </Text>
                    <Text style={{ color: theme.textSecondaryColor }}>
                      {prettyBytes(attachment.size)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: theme.borderColor,
        }}
      >
        <TextInput
          value={content}
          onChangeText={onContentChange}
          style={{
            flex: 1,
            color: theme.textColor,
            marginLeft: 16,
            paddingVertical: 0,
            marginVertical: 8,
          }}
          multiline
          numberOfLines={content.split("\n").length}
        ></TextInput>
        <View style={{ height: "100%", justifyContent: "flex-end" }}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => {
                pickFiles().then((filePaths) => {
                  filePaths.forEach((filePath) => {
                    api.getAttachment(filePath).then(({ size, hash }) => {
                      onAttachmentsChange([
                        ...attachments,
                        { size, hash, name: getFileNameFromPath(filePath) },
                      ]);
                    });
                  });
                });
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon
                icon={"paperclip"}
                color={theme.actionTextColor}
              />
            </Pressable>
            <Pressable onPress={onSend} style={{ padding: 16 }}>
              <FontAwesomeIcon
                icon={"paper-plane"}
                color={theme.actionTextColor}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
}

function getFileNameFromPath(path: string) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  return fileName;
}
