import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Api, Settings } from "./api";
import { Routes } from "./routing";
import { useSettings } from "./screens/SettingsScreen";
import { ThemeContext, themes } from "./theme";

const { library } = require("@fortawesome/fontawesome-svg-core");
const { fas } = require("@fortawesome/free-solid-svg-icons");
library.add(fas);

const queryClient = new QueryClient();

const ApiContext = React.createContext<Api>(null as any);

export function useApi() {
  return React.useContext(ApiContext);
}

type UiProps = {
  api: Api;
};
export function Ui({ api }: UiProps) {
  return (
    <ApiContext.Provider value={api}>
      <QueryClientProvider client={queryClient}>
        <SettingsConsumer>
          {(settings) => (
            <ThemeContext.Provider value={themes[settings.theme]}>
              <Routes
                initial={{ screen: "Accounts", parameters: {} }}
                isAnimated={settings.animations === "enabled"}
              />
            </ThemeContext.Provider>
          )}
        </SettingsConsumer>
      </QueryClientProvider>
    </ApiContext.Provider>
  );
}

function SettingsConsumer({
  children,
}: {
  children: (settings: Settings) => React.ReactNode;
}) {
  const [settings] = useSettings();
  return children(settings) as any;
}
