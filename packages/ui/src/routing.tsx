import React from "react";
import { CompositionScreen } from "./screens/CompositionScreen";
import { ContactScreen } from "./screens/ContactScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ContactsScreen } from "./screens/ContactsScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { DatabaseScreen } from "./screens/DatabaseScreen";
import { ConversationsScreen } from "./screens/ConversationsScreen";
import { NavigationScreen } from "./screens/NavigationScreen";
import { AccountsScreen } from "./screens/AccountsScreen";
import { AccountScreen } from "./screens/AccountScreen";

export type Routes = {
  Accounts: {};
  Account: { author?: string };
  Navigation: { account: string };
  Database: { account: string };
  Contacts: { account: string };
  Contact: { account: string; author?: string };
  Profile: { account: string; author: string };
  Composition: {
    account: string;
    author?: string;
    channel?: string;
    recipient?: string;
    quote?: string;
    salt?: string;
  };
  Conversations: {
    account: string;
    channel?: string;
  };
  Conversation: {
    account: string;
    channel: string;
    recipient: string;
  };
};

type Route = {
  [Screen in keyof Routes]: { screen: Screen; parameters: Routes[Screen] };
}[keyof Routes];

const mapping: {
  [Screen in keyof Routes]: React.ComponentType<Routes[Screen]>;
} = {
  Accounts: AccountsScreen,
  Account: AccountScreen,
  Navigation: NavigationScreen,
  Database: DatabaseScreen,
  Contacts: ContactsScreen,
  Contact: ContactScreen,
  Profile: ProfileScreen,
  Composition: CompositionScreen,
  Conversations: ConversationsScreen,
  Conversation: ConversationScreen,
};

type Routing = {
  push<Screen extends keyof Routes>(
    screen: Screen,
    parameters: Routes[Screen]
  ): void;
  back(): void;
};

const RoutingContext = React.createContext<Routing>(null as any);

type RoutesProps = {
  initial: Route;
};
export function Routes({ initial }: RoutesProps) {
  const [stack, setStack] = React.useState<Array<Route>>([]);
  const route = stack[stack.length - 1] ?? initial;
  const Screen = mapping[route.screen];
  const push = React.useCallback<Routing["push"]>((screen, parameters) => {
    setStack((stack) => [...stack, { screen, parameters: parameters as any }]);
  }, []);
  const back = React.useCallback(() => {
    setStack((stack) => stack.slice(0, -1));
  }, []);
  const value = React.useMemo<Routing>(() => ({ push, back }), []);
  return (
    <RoutingContext.Provider value={value}>
      <Screen {...(route.parameters as any)} />
    </RoutingContext.Provider>
  );
}

export function useRouting() {
  return React.useContext(RoutingContext);
}
