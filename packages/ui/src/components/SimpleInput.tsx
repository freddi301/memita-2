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
      <Text style={{ color: theme.textColor }}>{label as any}: </Text>
      <TextInput
        value={value}
        onChangeText={(newText) => {
          onChangeText(newText);
        }}
        editable={editable}
        style={{
          color: theme.textColor,
          paddingVertical: 0,
          height: multiline ? multiline * 16 : 32,
          backgroundColor: theme.backgroundColorSecondary,
        }}
        onBlur={onBlur}
        multiline={(multiline ?? 0) > 0}
        numberOfLines={multiline}
      />
      {description && (
        <Text style={{ color: theme.textSecondaryColor, marginBottom: 8 }}>
          {description as any}
        </Text>
      )}
    </View>
  );
}
