import { Alert, Platform } from "react-native";

export const DevAlert = {
  alert<Value>(title: string, buttons?: Array<{ text: string; value: Value }>) {
    if (Platform.OS === "web") {
      return new Promise((resolve) => {
        const modal = document.createElement("dialog");
        const titleElement = document.createElement("p");
        titleElement.innerText = title;
        modal.appendChild(titleElement);
        buttons?.forEach(({ text, value }) => {
          const button = document.createElement("button");
          button.innerText = text;
          button.onclick = () => {
            resolve(value);
            modal.close();
            document.body.removeChild(modal);
          };
          modal.appendChild(button);
        });
        document.body.appendChild(modal);
        modal.showModal();
      });
    } else {
      return new Promise((resolve) => {
        Alert.alert(
          title,
          undefined,
          buttons?.map(({ text, value }) => ({
            text,
            onPress() {
              resolve(value);
            },
          }))
        );
      });
    }
  },
};
