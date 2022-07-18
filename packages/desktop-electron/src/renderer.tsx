import { Api, Overrides, Ui } from "@memita-2/ui";
import React from "react";
import ReactDOM from "react-dom";
import { QrReader } from "react-qr-reader";

const api = new Proxy(
  {},
  {
    get(target, method, receiver) {
      return (...args: any[]) => (window as any).api(method, ...args);
    },
  }
) as Api;

const overrides: Overrides = {
  copyToClipboard: (window as any).copyToClipboard,
  QrCodeScanner({ onData, width, height }) {
    return (
      <QrReader
        constraints={{ width: { min: width }, height: { min: height } }}
        containerStyle={{ width, height }}
        videoContainerStyle={{ width, height }}
        videoStyle={{ width, height }}
        onResult={(result, error) => {
          if (result) {
            onData(result.getText());
          }
          if (error) {
            console.log(error);
            onData(null);
          }
        }}
      />
    );
  },
};

ReactDOM.render(
  <Ui api={api} overrides={overrides} />,
  document.getElementById("root")
);
