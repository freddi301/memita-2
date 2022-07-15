import { Api, Overrides, Ui } from "@memita-2/ui";
import React from "react";
import ReactDOM from "react-dom";

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
  QrCodeScanner() {
    React.useEffect(() => {
      window.alert("coming soon");
    }, []);
    return null;
  },
};

ReactDOM.render(
  <Ui api={api} overrides={overrides} />,
  document.getElementById("root")
);
