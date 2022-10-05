import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes, useRouting } from "../../routing";
import { useTheme } from "../../theme";
import { OverridesContext, useApi } from "../../ui";
import { BackButton } from "../../components/BackButton";
import { SimpleInput } from "../../components/SimpleInput";
import { I18n, useI18n } from "../../components/I18n";
import { Avatar } from "../../components/Avatar";
import { DevAlert } from "../../components/DevAlert";
import QRCode from "react-native-qrcode-svg";
import { HorizontalLoader } from "../../components/HorizontalLoader";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { AccountId, Settings } from "@memita-2/core";
const QRCodeAny = QRCode as any;

export function YourAccountScreen({ account }: Routes["YourAccount"]) {
  const routing = useRouting();
  const theme = useTheme();
  const [nickname, setNickname] = React.useState("");
  const api = useApi();
  const queryClient = useQueryClient();
  const accountQuery = useQuery(
    ["account", { account }],
    async () => {
      return await api.getAccount({ account });
    },
    {
      onSuccess(account) {
        if (account) setNickname(account.nickname);
      },
    }
  );
  const updateAccountMutation = useMutation(
    async ({
      account,
      nickname,
      settings,
    }: {
      account: AccountId;
      nickname: string;
      settings: Settings;
    }) => {
      await api.updateAccount({ account, nickname, settings });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );
  const deleteAccountMutation = useMutation(
    async ({ account }: { account: AccountId }) => {
      await api.deleteAccount({ account });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );
  const invite = useI18n({
    en: `Add me to your memita contacts!\nMy name is: ${nickname}\n\n${account}`,
    it: `Aggiungini ai tuoi contatti memita!\nIl mio nome è: ${nickname}\n\n${account}`,
  });
  const inviteCopied = useI18n({
    en: "Invite copied",
    it: "Invito copiato",
  });
  const promptDelete = useI18n({
    en: "Are you sure that you want to delete the account on this device? You will lose all related data on this device. This operation is irreversible.",
    it: "Sei sicuro di voler eliminare l'account da questo dispositivo? Perderai tutti i relativi dati su questo dispositivo. Questa operazione è irreversibile.",
  });
  const confirmDelete = useI18n({
    en: "Yes. Do delete",
    it: "Si. Elimina",
  });
  const cancelDelete = useI18n({
    en: "Do not delete",
    it: "Non eliminare",
  });
  const { copyToClipboard } = React.useContext(OverridesContext);
  const { width, height } = useWindowDimensions();
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
        <BackButton />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            flex: 1,
          }}
        >
          <I18n en="Your account" it="Il tuo account" />
        </Text>
        <Pressable
          onPress={async () => {
            if (accountQuery.data) {
              const deleteConfirmed = await DevAlert.alert(promptDelete, [
                { text: cancelDelete, value: false },
                { text: confirmDelete, value: true },
              ]);
              if (deleteConfirmed) {
                deleteAccountMutation.mutate(
                  { account },
                  {
                    onSuccess() {
                      routing.back();
                      routing.back();
                    },
                  }
                );
              }
            }
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"trash"} color={theme.actionTextColor} />
        </Pressable>
      </View>
      <ScrollView
        style={{ paddingVertical: 8 }}
        StickyHeaderComponent={() => (
          <HorizontalLoader isLoading={accountQuery.isFetching} />
        )}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ marginLeft: 16 }}>
            <Avatar size={96} />
          </View>
          <View style={{ flex: 1 }}>
            <SimpleInput
              label={<I18n en="Nickname" it="Soprannome" />}
              value={nickname}
              onChangeText={setNickname}
              onBlur={() => {
                if (accountQuery.data) {
                  const { settings } = accountQuery.data;
                  updateAccountMutation.mutate({ account, nickname, settings });
                }
              }}
              description={
                <I18n
                  en="An friendly name to help you remeber which account this is. It is visible only to you"
                  it="Un nome mnemonico per aiutarti a ricordare di quale account si tratta. E visibile solo a te."
                />
              }
            />
          </View>
        </View>
        <SimpleInput
          label={<I18n en="Author" it="Autore" />}
          value={AccountId.toReadableString(account)}
          onChangeText={() => {}}
          editable={false}
          multiline={2}
          description={
            <I18n
              en="Unique alphanumeric combinations that identifies your account. It is visible to others and is used to send you messages, like a phone number."
              it="Una combinazione alfanumerica unica che identifica il tuo account. E visibile agli altri e viene usata per inviarti i messaggi, come se fosse un numero di telefono."
            />
          }
        />
        <View style={{ alignItems: "center", marginVertical: 8 }}>
          <Pressable
            onPress={() => {
              if (Platform.OS === "web") {
                copyToClipboard(invite);
                DevAlert.alert(inviteCopied);
              } else {
                Share.share({ message: invite });
              }
            }}
          >
            <Text
              style={{
                color: theme.actionTextColor,
                textDecorationLine: "underline",
              }}
            >
              <I18n en="Send your contact" it="Invia il tuo contatto" />
            </Text>
          </Pressable>
          <Text
            style={{
              color: theme.textSecondaryColor,
              marginTop: 8,
            }}
          >
            <I18n en="or" it="oppure" />
          </Text>
          <Text
            style={{
              color: theme.textColor,
              textAlign: "center",
              paddingVertical: 8,
            }}
          >
            <I18n en="Let it scan" it="Fai inquadrare" />
          </Text>
          <View style={{ backgroundColor: "white", padding: 16 }}>
            <QRCodeAny value={invite} size={Math.min(width, height) - 64} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
