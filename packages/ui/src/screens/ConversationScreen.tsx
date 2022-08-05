import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes, useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { OverridesContext, useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { Avatar } from "../components/Avatar";
import { DateTime } from "luxon";
import { I18n } from "../components/I18n";
import { formatAuthor } from "../components/format";
import { Attachment, DirectMessage } from "../api";
import { DevAlert } from "../components/DevAlert";
import prettyBytes from "pretty-bytes";

export function ConversationScreen({ account, other }: Routes["Conversation"]) {
  const api = useApi();
  const theme = useTheme();
  const routing = useRouting();
  const queryClient = useQueryClient();
  const { pickFiles } = React.useContext(OverridesContext);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const conversationQuery = useQuery(
    ["conversation", { account, other }],
    async () => {
      return await api.getConversation({ account, other });
    },
    {
      refetchInterval: 1000,
      onSuccess() {
        setTimeout(() => {
          if (isAtEnd.current) ref.current?.scrollToEnd();
        }, 0);
      },
    }
  );
  const contactQuery = useQuery(
    ["contact", { account, author: other }],
    async () => {
      return await api.getContact({ account, author: other });
    }
  );
  const accountQuery = useQuery(["account", { account }], async () => {
    return await api.getAccount({ author: account });
  });
  const addDirectMessageMutation = useMutation(
    async (message: DirectMessage) => {
      await api.addDirectMessage(message);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["conversation"]);
        setContent("");
        setAttachments([]);
      },
    }
  );
  const [content, setContent] = React.useState("");
  const [attachments, setAttachments] = React.useState<Array<Attachment>>([]);
  const send = () => {
    const version_timestamp = Date.now();
    const salt = String(Math.random());
    addDirectMessageMutation.mutate({
      author: account,
      recipient: other ?? "",
      quote: "",
      salt,
      content,
      attachments,
      version_timestamp,
    });
  };
  const ref = React.useRef<FlatList<DirectMessage>>(null);
  const isAtEnd = React.useRef(true);
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          height: theme.headerHeight,
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
        }}
      >
        {isSearching ? (
          <React.Fragment>
            <TextInput
              value={searchText}
              onChangeText={(newText) => {
                setSearchText(newText);
              }}
              placeholder={"🔍"}
              style={{
                color: theme.textColor,
                flex: 1,
                paddingHorizontal: 16,
              }}
              autoFocus
            />
            <Pressable
              onPress={() => {
                setIsSearching(false);
                setSearchText("");
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"times"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <BackButton />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Avatar />
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={{
                    color: theme.textColor,
                    fontWeight: "bold",
                  }}
                >
                  {contactQuery.data?.nickname}
                </Text>
                <Text
                  style={{
                    color: theme.textColor,
                  }}
                >
                  {formatAuthor(other)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <FlatList
        data={conversationQuery.data}
        ref={ref}
        onScroll={(event) => {
          isAtEnd.current =
            event.nativeEvent.contentOffset.y +
              event.nativeEvent.layoutMeasurement.height >=
            event.nativeEvent.contentSize.height - 10;
        }}
        renderItem={({
          item: { author, content, attachments, version_timestamp },
        }) => {
          const datetime = DateTime.fromMillis(version_timestamp);
          return (
            <View>
              <Pressable
                onPress={() => {
                  DevAlert.alert("Coming soon");
                }}
                style={{
                  flexDirection: "row",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
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
                        : contactQuery.data?.nickname}
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
              </Pressable>
              {attachments.length > 0 && (
                <View
                  style={{
                    height: 48,
                  }}
                >
                  <ScrollView
                    horizontal={true}
                    style={{ flexDirection: "row" }}
                  >
                    {attachments.map((attachment, index, array) => {
                      return (
                        <Pressable
                          key={index}
                          style={{
                            flexDirection: "row",
                            borderLeftWidth: index === 0 ? 1 : 0,
                            borderRightWidth: 1,
                            borderTopWidth: 1,
                            borderBottomWidth: 1,
                            borderColor: theme.borderColor,
                            backgroundColor: theme.backgroundColorSecondary,
                          }}
                        >
                          <View
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              height: 48,
                              marginLeft: 16,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={"paperclip"}
                              color={theme.textSecondaryColor}
                            />
                          </View>
                          <View
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                            }}
                          >
                            <Text style={{ color: theme.textColor }}>
                              {attachment.name}
                            </Text>
                            <Text style={{ color: theme.textSecondaryColor }}>
                              {prettyBytes(attachment.size)}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          conversationQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              {isSearching ? (
                <React.Fragment>
                  <I18n
                    en="There are no messages for term"
                    it="Non ci sono messaggi per il termine"
                  />{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <I18n
                    en="There are no messages. Write some!"
                    it="Non ci sono messaggi. Scrivine qualcuno!"
                  />
                </React.Fragment>
              )}
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => conversationQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={conversationQuery.isFetching} />
        )}
      />
      {attachments.length > 0 && (
        <View
          style={{
            height: 48,
          }}
        >
          <ScrollView horizontal={true} style={{ flexDirection: "row" }}>
            {attachments.map((attachment, index, array) => {
              return (
                <Pressable
                  key={index}
                  style={{
                    flexDirection: "row",
                    borderLeftWidth: index === 0 ? 1 : 0,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderColor: theme.borderColor,
                    backgroundColor: theme.backgroundColorSecondary,
                  }}
                  onPress={() => {
                    setAttachments((attachments) => [
                      ...attachments.slice(0, index),
                      ...attachments.slice(index + 1),
                    ]);
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: 48,
                      marginLeft: 16,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={"paperclip"}
                      color={theme.textSecondaryColor}
                    />
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: theme.textColor }}>
                      {attachment.name}
                    </Text>
                    <Text style={{ color: theme.textSecondaryColor }}>
                      {prettyBytes(attachment.size)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: theme.borderColor,
        }}
      >
        <TextInput
          value={content}
          onChangeText={setContent}
          style={{
            flex: 1,
            color: theme.textColor,
            marginLeft: 16,
            paddingVertical: 0,
            marginVertical: 8,
          }}
          multiline
          numberOfLines={content.split("\n").length}
        ></TextInput>
        <View>
          <View style={{ flex: 1 }}></View>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => {
                pickFiles().then((filePaths) => {
                  filePaths.forEach((filePath) => {
                    api.getAttachment(filePath).then(({ size, hash }) => {
                      setAttachments((attachments) => [
                        ...attachments,
                        { size, hash, name: getFileNameFromPath(filePath) },
                      ]);
                    });
                  });
                });
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon
                icon={"paperclip"}
                color={theme.actionTextColor}
              />
            </Pressable>
            <Pressable onPress={send} style={{ padding: 16 }}>
              <FontAwesomeIcon
                icon={"paper-plane"}
                color={theme.actionTextColor}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function getFileNameFromPath(path: string) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  return fileName;
}
