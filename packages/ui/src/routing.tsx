import React from "react";
import { ContactScreen } from "./screens/ContactScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ContactsScreen } from "./screens/ContactsScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { DatabaseScreen } from "./screens/DatabaseScreen";
import { ConversationsScreen } from "./screens/ConversationsScreen";
import { NavigationScreen } from "./screens/NavigationScreen";
import {
  CreateNewAccountScreen,
  defaultSettings,
} from "./screens/account/CreateNewAccountScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import {
  Animated,
  BackHandler,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { ThemeContext, themes } from "./theme";
import { LanguageContext } from "./components/I18n";
import { useQuery, useQueryClient } from "react-query";
import { ConnectivityScreen } from "./screens/ConnectivityScreen";
import { ChooseAccountScreen } from "./screens/account/ChooseAccountScreen";
import { useApi } from "./ui";
import { YourAccountScreen } from "./screens/account/YourAccountScreen";

export type Routes = {
  ChooseAccount: { account: undefined };
  CreateNewAccount: { account: undefined };
  YourAccount: { account: string };
  Database: { account: string };
  Connectivity: { account: string };
  Settings: { account: string };
  Navigation: { account: string };
  Contacts: { account: string };
  Contact: { account: string; author?: string };
  Profile: { account: string; author: string };
  Conversations: { account: string };
  Conversation: { account: string; other: string };
};

type Route = {
  [Screen in keyof Routes]: { screen: Screen; parameters: Routes[Screen] };
}[keyof Routes] & { salt: number };

const mapping: {
  [Screen in keyof Routes]: React.ComponentType<Routes[Screen]>;
} = applyReactMemo({
  ChooseAccount: ChooseAccountScreen,
  CreateNewAccount: CreateNewAccountScreen,
  YourAccount: YourAccountScreen,
  Navigation: NavigationScreen,
  Settings: SettingsScreen,
  Connectivity: ConnectivityScreen,
  Database: DatabaseScreen,
  Contacts: ContactsScreen,
  Contact: ContactScreen,
  Profile: ProfileScreen,
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
};
export function Router({ initial }: RoutesProps) {
  const [{ stack, index }, setState] = React.useState<{
    stack: Array<Route>;
    index: number;
  }>({ stack: [initial], index: 0 });
  const push = React.useCallback<Routing["push"]>((screen, parameters) => {
    setState(({ stack, index }) => ({
      stack: [
        ...stack.slice(0, index + 1),
        { screen, parameters: parameters as any, salt: Math.random() },
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
  const { width } = useWindowDimensions();
  const route = stack[index] ?? initial;
  const queryClient = useQueryClient();
  const api = useApi();
  const accountQuery = useQuery(
    ["account", { author: route.parameters.account }],
    async () => {
      return await api.getAccount({ author: route.parameters.account ?? "" });
    },
    { enabled: route.parameters.account !== undefined }
  );
  const settings = accountQuery.data?.settings ?? defaultSettings;
  React.useEffect(() => {
    if (!isAnimating) {
      queryClient.invalidateQueries();
    }
  }, [isAnimating, queryClient]);
  const statusBar = (
    <StatusBar
      backgroundColor={themes[settings.theme].backgroundColorSecondary}
      barStyle={
        ({ dark: "light-content", light: "dark-content" } as const)[
          settings.theme
        ]
      }
    />
  );
  if (!(settings.animations === "enabled")) {
    const Screen = mapping[route.screen] as any;
    return (
      <RoutingContext.Provider value={value}>
        <ThemeContext.Provider value={themes[settings.theme]}>
          <LanguageContext.Provider value={settings.language}>
            {StatusBar}
            <Screen {...route.parameters} />
          </LanguageContext.Provider>
        </ThemeContext.Provider>
      </RoutingContext.Provider>
    );
  }
  return (
    <RoutingContext.Provider value={value}>
      <ThemeContext.Provider value={themes[settings.theme]}>
        <LanguageContext.Provider value={settings.language}>
          <View style={{ position: "relative", flex: 1 }}>
            {statusBar}
            {stack.map((route, i) => {
              const Screen = mapping[route.screen] as any;
              return (
                <Animated.View
                  key={route.salt}
                  style={{
                    display: !isAnimating && i !== index ? "none" : "flex",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    transform: [
                      {
                        translateX: Animated.add(indexAnimation, i).interpolate(
                          {
                            inputRange: [0, 1 * stack.length],
                            outputRange: [0, width * stack.length],
                          }
                        ),
                      },
                    ],
                  }}
                >
                  <Screen {...route.parameters} />
                </Animated.View>
              );
            })}
          </View>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </RoutingContext.Provider>
  );
}

export function useRouting() {
  return React.useContext(RoutingContext);
}
