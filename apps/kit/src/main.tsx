import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";

import favicon from "@ome-labs/brand/assets/app-icon/web/favicon.svg?url";
import { ThemeProvider, TooltipProvider } from "@ome-labs/ui-web";

import { router } from "./router.tsx";
import { storeTheme, storedTheme } from "./theme/preference.ts";

const icon = document.createElement("link");
icon.rel = "icon";
icon.href = favicon;
document.head.append(icon);

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider initial={storedTheme()} onChange={storeTheme}>
      <TooltipProvider delay={300}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
