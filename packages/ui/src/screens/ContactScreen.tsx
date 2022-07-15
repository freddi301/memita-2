import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { OverridesContext, useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";

export function ContactScreen({ account, ...original }: Routes["Contact"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const contactQuery = useQuery(
    ["contact", { account, author: original.author }],
    async () => {
      return await api.getContact({
        account,
        author: original.author ?? "",
      });
    }
  );
  const addContactMutation = useMutation(
    async ({ author, nickname }: { author: string; nickname: string }) => {
      const version_timestamp = Date.now();
      await api.addContact({
        account,
        author,
        nickname,
        label: "",
        version_timestamp,
      });
    }
  );
  const deleteContactMutation = useMutation(
    async (author: string) => {
      const version_timestamp = Date.now();
      await api.addContact({
        account,
        author,
        nickname,
        label: "deleted",
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [author, setAuthor] = React.useState(original.author ?? "");
  const [nickname, setNickname] = React.useState("");
  const [invite, setInvite] = React.useState("");
  React.useEffect(() => {
    if (contactQuery.data) {
      setNickname(contactQuery.data.nickname);
    }
  }, [contactQuery.data]);
  React.useEffect(() => {
    const match = invite.match(/[a-fA-F0-9]{64}/);
    if (match && match[0]) {
      setAuthor(match[0]);
    }
  }, [invite]);
  const [isQrCodeScannerOpen, setIsQrCodeScannerOpen] = React.useState(false);
  const { QrCodeScanner } = React.useContext(OverridesContext);
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
          {original.author ? (
            <I18n en="Contact" it="Contatto" />
          ) : (
            <I18n en="Add new contact" it="Aggiungi nuovo contatto" />
          )}
        </Text>
        {original.author && (
          <Pressable
            onPress={() => {
              deleteContactMutation.mutate(author, {
                onSuccess() {
                  routing.back();
                },
              });
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"trash"} color={theme.actionTextColor} />
          </Pressable>
        )}
        {!original.author && (
          <Pressable
            onPress={() => {
              addContactMutation.mutate(
                { author, nickname },
                {
                  onSuccess() {
                    routing.back();
                  },
                }
              );
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"check"} color={theme.actionTextColor} />
          </Pressable>
        )}
      </View>
      <ScrollView
        style={{ paddingVertical: 8 }}
        StickyHeaderComponent={() => (
          <HorizontalLoader isLoading={contactQuery.isFetching} />
        )}
      >
        <SimpleInput
          label={<I18n en="Author" it="Autore" />}
          value={author}
          onChangeText={setAuthor}
          editable={original.author === undefined}
          description={
            <I18n
              en="A unique combinations of letters that identifies your contact's account"
              it="Una combinazione unica di lettere che identificano l'account del tuo contatto"
            />
          }
          multiline={2}
        />
        <SimpleInput
          label={<I18n en="Nickname" it="Soprannome" />}
          value={nickname}
          onChangeText={setNickname}
          onBlur={() => addContactMutation.mutate({ author, nickname })}
          description={
            <I18n
              en="A friendly name to help you remeber the person who owns this account. It is visible only to you."
              it="Un nome legibile per ricordarti a quale persona appertiene questo account. E visibile solo a te."
            />
          }
        />
        {!original.author && (
          <SimpleInput
            label={<I18n en="Invite" it="Invito" />}
            value={invite}
            onChangeText={setInvite}
            multiline={6}
            description={
              <I18n
                en="Paste here the invite you received, it will fill the above fields automatically."
                it="Incolla qui l'invito che hai ricevuto, riempirà i campi qui sopra in automatico."
              />
            }
          />
        )}
        {!original.author && (
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={() => {
                setIsQrCodeScannerOpen(!isQrCodeScannerOpen);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              {isQrCodeScannerOpen ? (
                <Text style={{ color: theme.actionTextColor }}>
                  <I18n en="Close camera" it="Chiudi telecamera" />
                </Text>
              ) : (
                <Text style={{ color: theme.actionTextColor }}>
                  <I18n en="Scan QR Code" it="Inquadra QR Code" />
                </Text>
              )}
            </Pressable>
          </View>
        )}
        {isQrCodeScannerOpen && (
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              alignItems: "center",
              width: 400,
              height: 400,
            }}
          >
            <QrCodeScanner
              onData={(data) => {
                setInvite(data);
                setIsQrCodeScannerOpen(false);
              }}
              width={200}
              height={200}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
