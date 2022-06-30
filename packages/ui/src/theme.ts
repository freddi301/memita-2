import React from "react";

const dark = {
  backgroundColorPrimary: "#282c34",
  backgroundColorSecondary: "#21252b",
  textColor: "#abb2bf",
  textSecondaryColor: "#7f848e",
  activeColor: "#61afef",
  headerHeight: 48,
};

const light: typeof dark = {
  backgroundColorPrimary: "#ffffff",
  backgroundColorSecondary: "#efeff0",
  textColor: "#000000",
  textSecondaryColor: "#c4c4c4c4",
  activeColor: "#0a84ff",
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
