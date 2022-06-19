import React from "react";
import { AddProfileScreen } from "./screens/AddProfileScreen";
import { BlocksScreen } from "./screens/BlocksScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProfilesScreen } from "./screens/ProfilesScreen";

export type Routes = {
  Home: {};
  Blocks: {};
  Profiles: {};
  AddProfile: {};
};

type Route = {
  [Screen in keyof Routes]: { screen: Screen; parameters: Routes[Screen] };
}[keyof Routes];

const mapping: {
  [Screen in keyof Routes]: React.ComponentType<Routes[Screen]>;
} = {
  Home: HomeScreen,
  Blocks: BlocksScreen,
  Profiles: ProfilesScreen,
  AddProfile: AddProfileScreen,
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
    setStack((stack) => [...stack, { screen, parameters }]);
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
