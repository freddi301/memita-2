import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../theme";
import { Avatar } from "../screens/Avatar";
import { DateTime } from "luxon";
import { Composition } from "../api";

type CompositionListItemProps = Composition & { versions: number };
export function CompositionListItem({
  author,
  channel,
  recipient,
  salt,
  thread,
  text,
  timestamp,
  versions,
}: CompositionListItemProps): React.ReactElement<
  any,
  string | React.JSXElementConstructor<any>
> | null {
  const routing = useRouting();
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        routing.push("Compose", {
          author,
          channel,
          recipient,
          thread,
          salt,
          ...(text ? { text } : {}),
        });
      }}
    >
      <View style={{ flexDirection: "row", padding: 8 }}>
        <Avatar />
        <View style={{ marginHorizontal: 8, flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            {channel && (
              <Text style={{ color: theme.textColor }}>{channel} | </Text>
            )}
            <Text
              style={{
                color: theme.textColor,
                fontWeight: "bold",
              }}
            >
              {author}
            </Text>
            {recipient && (
              <React.Fragment>
                <View style={{ marginHorizontal: 4 }}>
                  <FontAwesomeIcon
                    icon={"arrow-right"}
                    color={theme.textColor}
                  />
                </View>
                <Text
                  style={{
                    color: theme.textColor,
                    fontWeight: "bold",
                  }}
                >
                  {recipient}
                </Text>
              </React.Fragment>
            )}
          </View>
          <Text
            style={{
              color: theme.textColor,
            }}
          >
            {text}
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: "row" }}>
            {thread && (
              <View style={{ marginRight: 8 }}>
                <FontAwesomeIcon icon={"reply"} color={theme.textColor} />
              </View>
            )}
            {versions > 1 && (
              <View style={{ marginRight: 8 }}>
                <FontAwesomeIcon
                  icon={"clock-rotate-left"}
                  color={theme.textColor}
                />
              </View>
            )}
            <Text
              style={{
                color: theme.textColor,
                textAlign: "right",
                flex: 1,
              }}
            >
              {DateTime.fromMillis(timestamp).toLocaleString(
                DateTime.TIME_WITH_SECONDS
              )}
            </Text>
          </View>
          <Text style={{ color: theme.textColor, textAlign: "right" }}>
            {DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATE_MED)}
          </Text>
          <Text></Text>
        </View>
      </View>
    </Pressable>
  );
}
