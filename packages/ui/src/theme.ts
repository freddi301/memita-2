import React from "react";

const dark = {
  backgroundColorPrimary: "#282c34",
  backgroundColorSecondary: "#21252b",
  textColor: "#abb2bf",
  textSecondaryColor: "#7f848e",
  errorColor: "#f64587",
  activeColor: "#61afef",
  actionTextColor: "#abb2bf",
  borderColor: "#0a0a00a",
  mockColor: "#74b3f0",
  headerHeight: 48,
};

const light: typeof dark = {
  backgroundColorPrimary: "#ffffff",
  backgroundColorSecondary: "#f7f7f7",
  textColor: "#000000",
  textSecondaryColor: "#5a5a5e",
  errorColor: "#f64587",
  activeColor: "#0a84ff",
  actionTextColor: "#5899da",
  borderColor: "lightgray",
  mockColor: "#5899da",
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
