import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { useQuery } from "react-query";
import { useApi } from "../ui";
import { DateTime } from "luxon";
import { MessageAttachments } from "../components/MessageAttachments";
import { PublicMessage } from "../api";
import { formatAuthor } from "./format";
import { useRouting } from "../routing";

export function PublicMessageView({
  account,
  publicMessage: { author, content, attachments, version_timestamp },
}: {
  account: string;
  publicMessage: PublicMessage;
}) {
  const theme = useTheme();
  const routing = useRouting();
  const datetime = DateTime.fromMillis(version_timestamp);
  const api = useApi();
  const contactQuery = useQuery(
    ["contact", { author }],
    async () => {
      return await api.getContact({ account, author });
    },
    {
      enabled: account !== author,
    }
  );
  const accountQuery = useQuery(
    ["account", { account }],
    async () => {
      return await api.getAccount({ author: account });
    },
    {
      enabled: account === author,
    }
  );
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ marginRight: 16 }}>
          <Avatar
            onPress={() => {
              routing.push("Profile", { account, author });
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                color: theme.textColor,
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {author === account
                ? accountQuery.data?.nickname
                : contactQuery.data?.nickname}{" "}
              <Text
                style={{
                  color: theme.textSecondaryColor,
                  fontWeight: "normal",
                }}
              >
                {formatAuthor(author)}
              </Text>
            </Text>
            <Text
              style={{
                color: theme.textSecondaryColor,
              }}
            >
              {!datetime.hasSame(DateTime.now(), "day") &&
                datetime.toLocaleString(DateTime.DATE_MED)}
              {"  "}
              {datetime.toLocaleString(DateTime.TIME_WITH_SECONDS)}
            </Text>
          </View>
          <Text
            style={{
              color: theme.textColor,
            }}
          >
            {content}
          </Text>
        </View>
      </View>
      <View style={{ paddingLeft: 62 }}>
        {attachments.length > 0 && (
          <MessageAttachments attachments={attachments} />
        )}
      </View>
    </View>
  );
}
