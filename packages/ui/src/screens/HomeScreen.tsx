import React from "react";
import { Button, View } from "react-native";
import { useRouting } from "../routing";

export function HomeScreen() {
  const routing = useRouting();
  return (
    <View>
      <Button
        title="Blocks"
        onPress={() => {
          routing.push("Blocks", {});
        }}
      />
      <Button
        title="Profiles"
        onPress={() => {
          routing.push("Profiles", {});
        }}
      />
    </View>
  );
}
