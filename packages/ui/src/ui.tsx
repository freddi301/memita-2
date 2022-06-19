import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Api } from "./api";
import { Routes } from "./routing";

const queryClient = new QueryClient();

export const ApiContext = React.createContext<Api>(null as any);

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
