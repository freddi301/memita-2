import React from "react";

const darkTheme = {
  backgroundColorPrimary: "#282c34",
  backgroundColorSecondary: "#21252b",
  textColor: "#abb2bf",
  activeColor: "#61afef",
  headerHeight: 48,
};

const ThemeContext = React.createContext(darkTheme);

export function useTheme() {
  return React.useContext(ThemeContext);
}
