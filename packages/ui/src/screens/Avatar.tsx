import React from "react";
import { Pressable } from "react-native";

export function Avatar() {
  return (
    <Pressable
      style={{
        backgroundColor: "white",
        width: 32,
        height: 32,
        borderRadius: 16,
      }}
    ></Pressable>
  );
}
