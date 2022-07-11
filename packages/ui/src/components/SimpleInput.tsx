import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

type SimpleInputProps = {
  label: React.ReactNode;
  value: string;
  onChangeText(text: string): void;
  editable?: boolean;
  description?: React.ReactNode;
};
export function SimpleInput({
  label,
  value,
  onChangeText,
  editable,
  description,
}: SimpleInputProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "column", paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.textColor, fontWeight: "bold" }}>
          {label as any} :{" "}
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
      {description && (
        <Text style={{ color: theme.textSecondaryColor, marginBottom: 8 }}>
          {description as any}
        </Text>
      )}
    </View>
  );
}
