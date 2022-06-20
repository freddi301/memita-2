import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

type SimpleInputProps = {
  label: string;
  value: string;
  onChangeText(text: string): void;
  multiline?: boolean;
  editable?: boolean;
};
export function SimpleInput({
  label,
  value,
  onChangeText,
  multiline,
  editable,
}: SimpleInputProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: multiline ? "column" : "row",
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
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
        editable={editable}
        numberOfLines={4}
        style={{
          color: theme.textColor,
          flex: 1,
        }}
      />
    </View>
  );
}
