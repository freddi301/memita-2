import React from "react";

const dark = {
  backgroundColorPrimary: "#282c34",
  backgroundColorSecondary: "#21252b",
  textColor: "#abb2bf",
  textSecondaryColor: "#7f848e",
  activeColor: "#61afef",
  actionTextColor: "#abb2bf",
  borderColor: "transparent",
  mockColor: "#74B3F0",
  headerHeight: 48,
};

const light: typeof dark = {
  backgroundColorPrimary: "#ffffff",
  backgroundColorSecondary: "#f7f7f7",
  textColor: "#000000",
  textSecondaryColor: "#8A8A8E",
  activeColor: "#0a84ff",
  actionTextColor: "#5899DA",
  borderColor: "lightgray",
  mockColor: "#5899DA",
  headerHeight: 48,
};

export const themes = {
  dark,
  light,
};

export const ThemeContext = React.createContext(dark);

export function useTheme() {
  return React.useContext(ThemeContext);
}
