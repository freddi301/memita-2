import React from "react";
import { Image, Text, View } from "react-native";
import { useQuery } from "react-query";
import { BackButton } from "../components/BackButton";
import { I18n } from "../components/I18n";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";

export function FileViewScreen({ hash }: Routes["FileView"]) {
  const theme = useTheme();
  const api = useApi();
  const uriQuery = useQuery(["attachment-uri", { hash }], async () => {
    return await api.getAttachmentUri(hash);
  });
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
          <I18n en="File" it="File" />
        </Text>
      </View>
      {uriQuery.data && (
        <Image
          style={{ width: "100%", height: "100%", resizeMode: "center" }}
          source={{
            uri: "file://" + uriQuery.data,
          }}
        />
      )}
    </View>
  );
}
