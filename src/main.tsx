import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: ONE_DAY,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "pl-query-cache",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        buster: "v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (q) => {
            const key = q.queryKey?.[0];
            // Don't persist auth (token-bound) or notifications (changes too fast).
            if (key === "auth" || key === "notifications") return false;
            return q.state.status === "success";
          },
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
