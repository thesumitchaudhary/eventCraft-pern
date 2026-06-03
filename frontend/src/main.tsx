import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@mantine/core/styles.css";
import App from "./App.tsx";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

import { ContextProvider } from "./context/Context";
import { EventProvider } from "./context/EventContext";

const client = new QueryClient();
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <ContextProvider>
        <EventProvider>
          <Router>
            <QueryClientProvider client={client}>
              <App />
            </QueryClientProvider>
          </Router>
        </EventProvider>
      </ContextProvider>
    </MantineProvider>
  </StrictMode>,
);
