import React from "react";
import { CompositionScreen } from "./screens/CompositionScreen";
import { AuthotEditScren } from "./screens/AuthorEditScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { AuthorScreen } from "./screens/AuthorScreen";
import { AuthorsScreen } from "./screens/AuthorsScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { DatabaseScreen } from "./screens/DatabaseScreen";
import { ConversationsScreen } from "./screens/ConversationsScreen";

export type Routes = {
  Home: {};
  Database: {};
  Authors: {};
  AuthorEdit: { author?: string; nickname?: string };
  Author: { author: string; nickname: string };
  Composition: {
    author?: string;
    channel?: string | null;
    recipient?: string | null;
    quote?: string | null;
    salt?: string;
    content?: string;
  };
  Conversations: {
    author: string;
  };
  Conversation: {
    author: string;
    recipient: string;
  };
};

type Route = {
  [Screen in keyof Routes]: { screen: Screen; parameters: Routes[Screen] };
}[keyof Routes];

const mapping: {
  [Screen in keyof Routes]: React.ComponentType<Routes[Screen]>;
} = {
  Home: HomeScreen,
  Database: DatabaseScreen,
  Authors: AuthorsScreen,
  AuthorEdit: AuthotEditScren,
  Author: AuthorScreen,
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
  initial: Route[];
};
export function Routes({ initial }: RoutesProps) {
  const [stack, setStack] = React.useState<Array<Route>>(initial);
  const route = stack[stack.length - 1] ?? initial[0];
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
