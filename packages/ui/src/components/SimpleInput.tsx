import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

type SimpleInputProps = {
  label: string;
  value: string;
  onChangeText(text: string): void;
  multiline?: boolean;
};
export function SimpleInput({
  label,
  value,
  onChangeText,
  multiline,
}: SimpleInputProps) {
  const theme = useTheme();
  return (
    <View
      style={{ flexDirection: multiline ? "column" : "row", padding: "16px" }}
    >
      <Text style={{ color: theme.textColor, fontWeight: "bold" }}>
        {label} :{" "}
      </Text>
      <TextInput
        value={value}
        onChangeText={(newText) => {
          onChangeText(newText);
        }}
        multiline={multiline}
        style={{
          color: theme.textColor,
          borderWidth: 0,
          flex: 1,
        }}
        numberOfLines={4}
      />
    </View>
  );
}
