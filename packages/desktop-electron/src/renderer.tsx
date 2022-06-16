import { Ui } from "@memita-2/ui";
import React from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root") as Element).render(
  <Ui api={window.electronAPI} />
);
