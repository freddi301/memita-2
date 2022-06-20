import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "./Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useMutation, useQuery } from "react-query";
import { useApi } from "../ui";
import { CompositionListItem } from "../components/CompositionListItem";

export function ProfileScreen({ id }: Routes["Profile"]) {
  const theme = useTheme();
  const routing = useRouting();
  const api = useApi();
  const deleteProfileMutation = useMutation(
    async (id: string) => {
      await api.deleteProfile(id);
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const compositionsQuery = useQuery(
    ["compositions", { author: id }],
    async () => {
      return api.getCompositions({ author: id });
    }
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
        }}
      >
        <BackButton />
        <Avatar />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: "16px",
            borderBottomColor: "gray",
            flex: 1,
            marginLeft: 8,
          }}
        >
          {id}
        </Text>
        <Pressable
          onPress={() => {
            deleteProfileMutation.mutate(id);
          }}
          style={{ padding: "16px" }}
        >
          <FontAwesomeIcon icon={"trash"} color={theme.textColor} />
        </Pressable>
      </View>
      <FlatList
        data={compositionsQuery.data}
        renderItem={({ item }) => <CompositionListItem {...item} />}
      />
    </View>
  );
}
