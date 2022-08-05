import React from "react";

const dark = {
  backgroundColorPrimary: "#23272e",
  backgroundColorSecondary: "#1e2227",
  textColor: "#abb2bf",
  textSecondaryColor: "#7f848e",
  errorColor: "#f64587",
  activeColor: "#61efaf",
  actionTextColor: "#61afef",
  borderColor: "#5f646e",
  mockColor: "#74b3f0",
  headerHeight: 48,
};

const light: typeof dark = {
  backgroundColorPrimary: "#ffffff",
  backgroundColorSecondary: "#f7f7f7",
  textColor: "#000000",
  textSecondaryColor: "#8a8a8e",
  errorColor: "#f64587",
  activeColor: "#83b983",
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
