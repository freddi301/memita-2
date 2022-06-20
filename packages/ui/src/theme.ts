import React from "react";

const darkTheme = {
  backgroundColorPrimary: "#282c34",
  backgroundColorSecondary: "#21252b",
  textColor: "#abb2bf",
  loadingColor: "#61afef",
  activeColor: "#61afef",
};

const ThemeContext = React.createContext(darkTheme);

export function useTheme() {
  return React.useContext(ThemeContext);
}
