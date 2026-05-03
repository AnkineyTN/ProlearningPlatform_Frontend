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
