import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

type SimpleInputProps = {
  label: React.ReactNode;
  value: string;
  onChangeText(text: string): void;
  editable?: boolean;
  description?: React.ReactNode;
  onBlur?(): void;
  multiline?: number;
};
export function SimpleInput({
  label,
  value,
  onChangeText,
  editable,
  description,
  onBlur,
  multiline,
}: SimpleInputProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ color: theme.textColor, marginBottom: 4 }}>
        {label as any}:{" "}
      </Text>
      <TextInput
        value={value}
        onChangeText={(newText) => {
          onChangeText(newText);
        }}
        editable={editable}
        style={{
          color: theme.textColor,
          padding: 8,
          height: multiline ? multiline * 16 + 16 : 32,
          backgroundColor: theme.backgroundColorSecondary,
        }}
        onBlur={onBlur}
        multiline={(multiline ?? 0) > 0}
        numberOfLines={multiline}
      />
      {description && (
        <Text
          style={{
            color: theme.textSecondaryColor,
            marginBottom: 8,
            marginTop: 4,
          }}
        >
          {description as any}
        </Text>
      )}
    </View>
  );
}
