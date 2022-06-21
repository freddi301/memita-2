import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

type SimpleInputProps = {
  label: string;
  value: string;
  onChangeText(text: string): void;
  editable?: boolean;
};
export function SimpleInput({
  label,
  value,
  onChangeText,
  editable,
}: SimpleInputProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        alignItems: "center",
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
        editable={editable}
        style={{
          color: theme.textColor,
          flex: 1,
          padding: 0,
          height: 32,
        }}
      />
    </View>
  );
}
