import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Api } from "./api";
import { Routes } from "./routing";

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
        <Routes initial={{ screen: "Home", parameters: {} }} />
      </QueryClientProvider>
    </ApiContext.Provider>
  );
}
