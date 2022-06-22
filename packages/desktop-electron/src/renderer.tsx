import { Api, Ui } from "@memita-2/ui";
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

ReactDOM.render(<Ui api={api} />, document.getElementById("root"));
