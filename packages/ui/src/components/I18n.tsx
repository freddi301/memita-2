import React from "react";

export const LanguageContext = React.createContext<Language>("en");

const l10n = {
  en: {},
  it: {},
};

export type Language = keyof typeof l10n;

type I18nProps = { [L in Language]: string };
export function I18n(props: I18nProps): JSX.Element {
  const language = React.useContext(LanguageContext);
  return (props[language] ?? `<missing label for language ${language}>`) as any;
}
