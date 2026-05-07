import "react-toastify/dist/ReactToastify.css";
import "./i18n/config";

import { useEffect } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/theme/theme-provider.tsx";
import { ColorThemeProvider } from "@/components/theme/color-theme-provider.tsx";
import { authAPI } from "@/services/endpoints/auth.ts";

import { routeConfig } from "./config/routeConfig.tsx";

function AppRoutes() {
  const routes = useRoutes(routeConfig);
  return routes;
}

function App() {
  useEffect(() => {
    try {
      const href = window.location.href;
      const accessMatch = href.match(/[?&]accessToken=([^&]+)/);
      const refreshMatch = href.match(/[?&]refreshToken=([^&]+)/);
      if (accessMatch && accessMatch[1]) {
        const token = decodeURIComponent(accessMatch[1]);
        localStorage.setItem("token", token);
        if (refreshMatch && refreshMatch[1]) {
          localStorage.setItem(
            "refreshToken",
            decodeURIComponent(refreshMatch[1]),
          );
        }

        const cleaned = href
          .replace(/([?&])accessToken=[^&]*(&?)/, (_match, p1, p2) => {
            if (p1 === "?" && p2 === "&") return "?";
            return p2 ? p1 : "";
          })
          .replace(/([?&])refreshToken=[^&]*(&?)/, (_match, p1, p2) => {
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
        // Interceptor đã xử lý refresh + redirect khi cần
      });
    }
  }, []);
  const theme = localStorage.getItem("vite-ui-theme") || "dark";

  return (
    <>
      <ToastContainer theme={theme} />
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <ColorThemeProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ColorThemeProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
