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
import { SettingsScreen } from "./screens/SettingsScreen";
import { Animated, BackHandler, useWindowDimensions, View } from "react-native";
import { ChannelsScreen } from "./screens/ChannelsScreen";
import { ChannelScreen } from "./screens/ChannelScreen";

export type Routes = {
  Accounts: {};
  Database: { account: string };
  Settings: { account: string };
  Account: { author?: string };
  Navigation: { account: string };
  Contacts: { account: string };
  Contact: { account: string; author?: string };
  Channels: { account: string };
  Channel: { account: string; channel?: string };
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
    other: string;
  };
};

type Route = {
  [Screen in keyof Routes]: { screen: Screen; parameters: Routes[Screen] };
}[keyof Routes];

const mapping: {
  [Screen in keyof Routes]: React.ComponentType<Routes[Screen]>;
} = applyReactMemo({
  Accounts: AccountsScreen,
  Account: AccountScreen,
  Navigation: NavigationScreen,
  Settings: SettingsScreen,
  Database: DatabaseScreen,
  Contacts: ContactsScreen,
  Contact: ContactScreen,
  Channels: ChannelsScreen,
  Channel: ChannelScreen,
  Profile: ProfileScreen,
  Composition: CompositionScreen,
  Conversations: ConversationsScreen,
  Conversation: ConversationScreen,
});

function applyReactMemo<M extends Record<string, React.ComponentType<any>>>(
  componentMap: M
): M {
  return Object.fromEntries(
    Object.entries(componentMap).map(([key, component]) => [
      key,
      React.memo(component),
    ])
  ) as any;
}

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
  isAnimated: boolean;
};
export function Routes({ initial, isAnimated }: RoutesProps) {
  const [{ stack, index }, setState] = React.useState<{
    stack: Array<Route>;
    index: number;
  }>({ stack: [initial], index: 0 });
  const push = React.useCallback<Routing["push"]>((screen, parameters) => {
    setState(({ stack, index }) => ({
      stack: [
        ...stack.slice(0, index + 1),
        { screen, parameters: parameters as any },
      ],
      index: index + 1,
    }));
  }, []);
  const back = React.useCallback(() => {
    setState(({ stack, index }) => ({
      stack,
      index: Math.max(0, index - 1),
    }));
    return true;
  }, []);
  React.useLayoutEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", back);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", back);
    };
  }, [back]);
  const value = React.useMemo<Routing>(() => ({ push, back }), [push, back]);
  const indexAnimation = React.useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = React.useState(false);
  const duration = 300;
  React.useLayoutEffect(() => {
    const animation = Animated.timing(indexAnimation, {
      toValue: -index,
      duration,
      useNativeDriver: true,
    });
    animation.start();
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), duration);
    return () => {
      animation.stop();
      clearTimeout(timeout);
    };
  }, [index, indexAnimation]);
  const { height, width, scale } = useWindowDimensions();
  if (!isAnimated) {
    const route = stack[index] ?? initial;
    const Screen = mapping[route.screen];
    return (
      <RoutingContext.Provider value={value}>
        <Screen {...(route.parameters as any)} />
      </RoutingContext.Provider>
    );
  }
  return (
    <RoutingContext.Provider value={value}>
      <View style={{ position: "relative", flex: 1 }}>
        {stack.map((route, i) => {
          if (!isAnimating && i !== index) return null;
          const Screen = mapping[route.screen];
          return (
            <Animated.View
              key={i}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                transform: [
                  {
                    translateX: Animated.add(indexAnimation, i).interpolate({
                      inputRange: [0, 1 * stack.length],
                      outputRange: [0, width * stack.length],
                    }),
                  },
                ],
              }}
            >
              <Screen {...(route.parameters as any)} />
            </Animated.View>
          );
        })}
      </View>
    </RoutingContext.Provider>
  );
}

export function useRouting() {
  return React.useContext(RoutingContext);
}
