import { Api, Ui } from "@memita-2/ui";
import React from "react";
import { createRoot } from "react-dom/client";

const api = new Proxy(
  {},
  {
    get(target, method, receiver) {
      return (...args: any[]) => (window as any).api(method, ...args);
    },
  }
) as Api;

createRoot(document.getElementById("root") as Element).render(<Ui api={api} />);
