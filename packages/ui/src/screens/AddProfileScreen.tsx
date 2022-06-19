import React from "react";
import { Pressable, Text, View } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { useRouting } from "../routing";
import { useTheme } from "../theme";
import { ApiContext } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";

export function AddProfileScreen() {
  const routing = useRouting();
  const theme = useTheme();
  const api = React.useContext(ApiContext);
  const queryClient = useQueryClient();
  const profilesMutation = useMutation(
    async (id: string) => {
      await api.addProfile(id);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries("profiles");
        routing.back();
      },
    }
  );
  const [id, setId] = React.useState("");
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
          Add profile
        </Text>
        <Pressable
          onPress={() => {
            profilesMutation.mutate(id);
          }}
          style={{ padding: "16px" }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.textColor} />
        </Pressable>
      </View>
      <SimpleInput label="id" value={id} onChangeText={setId} />
    </View>
  );
}
