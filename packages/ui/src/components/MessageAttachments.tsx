import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Attachment } from "@memita-2/core";
import prettyBytes from "pretty-bytes";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouting } from "../routing";
import { useTheme } from "../theme";

type MessageAttachmentsProps = {
  attachments: Array<Attachment>;
};
export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const theme = useTheme();
  const routing = useRouting();
  return (
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
                borderBottomWidth: 1,
                borderColor: theme.borderColor,
                backgroundColor: theme.backgroundColorSecondary,
              }}
              onPress={() => {
                routing.push("FileView", {
                  account: undefined,
                  hash: attachment.hash,
                });
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
                  justifyContent: "center",
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
  );
}
