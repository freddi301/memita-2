import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../routing";
import { ApiContext } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { Avatar } from "./Avatar";

export function ProfilesScreen() {
  const api = React.useContext(ApiContext);
  const profilesQuery = useQuery(["profiles"], async () => {
    return api.getProfiles();
  });
  const routing = useRouting();
  const theme = useTheme();
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
            flex: 1,
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: "16px",
            borderBottomColor: "gray",
          }}
        >
          Profiles
        </Text>
        <Pressable
          onPress={() => {
            routing.push("AddProfile", {});
          }}
          style={{ padding: "16px" }}
        >
          <FontAwesomeIcon icon={"plus"} color={theme.textColor} />
        </Pressable>
      </View>
      <FlatList
        data={profilesQuery.data}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              routing.push("Profile", { id: item.id });
            }}
          >
            <View style={{ flexDirection: "row", padding: 8 }}>
              <Avatar />
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={{
                    color: theme.textColor,
                    fontWeight: "bold",
                  }}
                >
                  {item.id}
                </Text>
                <Text
                  style={{
                    color: theme.textColor,
                  }}
                >
                  Some description
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
