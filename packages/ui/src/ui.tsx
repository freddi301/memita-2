import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Api } from "./api";
import { Router } from "./routing";

const { library } = require("@fortawesome/fontawesome-svg-core");
const { fas } = require("@fortawesome/free-solid-svg-icons");
library.add(fas);

const queryClient = new QueryClient();

const ApiContext = React.createContext<Api>(null as any);

export function useApi() {
  return React.useContext(ApiContext);
}

export const OverridesContext = React.createContext<Overrides>(null as any);
export type Overrides = {
  copyToClipboard(text: string): void;
  QrCodeScanner: React.ComponentType<{
    onData(data: string): void;
    width: number;
    height: number;
  }>;
};

type UiProps = {
  api: Api;
  overrides: Overrides;
};
export function Ui({ api, overrides }: UiProps) {
  return (
    <OverridesContext.Provider value={overrides}>
      <ApiContext.Provider value={api}>
        <QueryClientProvider client={queryClient}>
          <Router
            initial={{
              screen: "ChooseAccount",
              parameters: { account: undefined },
              salt: 0,
            }}
          />
        </QueryClientProvider>
      </ApiContext.Provider>
    </OverridesContext.Provider>
  );
}
