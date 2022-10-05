import React from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../../routing";
import { useTheme } from "../../theme";
import { Avatar } from "../../components/Avatar";
import { useApi } from "../../ui";
import { HorizontalLoader } from "../../components/HorizontalLoader";
import { I18n } from "../../components/I18n";
import { formatAuthor } from "../../components/format";
import { DevAlert } from "../../components/DevAlert";

export function ChooseAccountScreen() {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const accountsQuery = useQuery(["accounts", {}], async () => {
    return await api.getAccounts({});
  });
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColorSecondary,
        alignItems: "center",
      }}
    >
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <Logo />
      </View>
      <FlatList
        data={accountsQuery.data}
        style={{
          width: 200,
        }}
        renderItem={({ item: { account, nickname } }) => (
          <Pressable
            onPress={() => {
              routing.push("Navigation", { account });
            }}
            style={{
              flexDirection: "row",
              paddingVertical: 8,
              paddingHorizontal: 16,
              alignItems: "center",
              backgroundColor: theme.backgroundColorPrimary,
              borderBottomWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <Avatar />
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  color: theme.textColor,
                  fontWeight: "bold",
                }}
              >
                {nickname}
              </Text>
              <Text
                style={{
                  color: theme.textColor,
                }}
              >
                {formatAuthor(account)}
              </Text>
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => accountsQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={accountsQuery.isFetching} />
        )}
      />
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 48,
        }}
      >
        <Pressable onPress={() => DevAlert.alert("Coming soon")}>
          <Text
            style={{
              color: theme.actionTextColor,
              textDecorationLine: "underline",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            {accountsQuery.data?.length === 0 ? (
              <I18n en="Use existing account" it="Usa un account esistente" />
            ) : (
              <I18n en="Add another account" it="Aggiungi un altro account" />
            )}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("CreateNewAccount", { account: undefined });
          }}
        >
          <Text
            style={{
              color: theme.actionTextColor,
              textDecorationLine: "underline",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <I18n en="Create new account" it="Crea un nuovo account" />
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Logo() {
  const theme = useTheme();
  return (
    <View>
      <Text
        style={{
          color: theme.textColor,
          fontSize: 48,
          fontFamily: "monospace",
        }}
      >
        ME
      </Text>
      <Text
        style={{
          color: theme.textColor,
          fontSize: 48,
          fontFamily: "monospace",
        }}
      >
        MI
      </Text>
      <Text
        style={{
          color: theme.textColor,
          fontSize: 48,
          fontFamily: "monospace",
        }}
      >
        TA
      </Text>
    </View>
  );
}
