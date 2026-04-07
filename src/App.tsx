import "react-toastify/dist/ReactToastify.css";
import "./i18n/config";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/theme/theme-provider.tsx";
import { authAPI } from "@/services/endpoints/auth.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeConfig } from "./config/routeConfig.tsx";
import { store } from "./store";

const queryClient = new QueryClient();

function AppRoutes() {
  const routes = useRoutes(routeConfig);
  return routes;
}

function App() {
  useEffect(() => {
    try {
      const href = window.location.href;
      const match = href.match(/[?&]accessToken=([^&]+)/);
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        localStorage.setItem("token", token);

        const cleaned = href
          .replace(/([?&])accessToken=[^&]*(&?)/, (_match, p1, p2) => {
            if (p1 === "?" && p2 === "&") return "?";
            return p2 ? p1 : "";
          })
          .replace(/[?&]$/, "");

        window.history.replaceState({}, "", cleaned);
        window.location.reload();
      }
    } catch {
      // ignore
    }

    const token = localStorage.getItem("token");
    if (token) {
      authAPI.getMe().catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
    }
  }, []);
  const theme = localStorage.getItem("vite-ui-theme") || "dark";

  return (
    <Provider store={store}>
      <ToastContainer theme={theme} />
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppRoutes />
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
