import './i18n/config';

import { useEffect } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';

import { ColorThemeProvider } from '@/components/theme/color-theme-provider.tsx';
import { ThemeProvider } from '@/components/theme/theme-provider.tsx';
import { Toaster } from '@/components/ui/sonner';
import {
  PomodoroProvider,
  usePomodoroContext,
} from '@/contexts/PomodoroContext';
import PomodoroFloatingWidget from '@/pages/Pomodoro/components/PomodoroFloatingWidget.tsx';
import SoundLayer from '@/pages/Pomodoro/components/SoundLayer.tsx';
import { authAPI } from '@/services/endpoints/auth.ts';

import { routeConfig } from './config/routeConfig.tsx';

// Renders inside Router so useLocation works, and inside PomodoroProvider.
function AppContent() {
  const routes = useRoutes(routeConfig);
  const { activeSounds } = usePomodoroContext();
  return (
    <>
      <SoundLayer activeSounds={activeSounds} />
      <PomodoroFloatingWidget />
      {routes}
    </>
  );
}

function App() {
  useEffect(() => {
    try {
      const href = window.location.href;
      const accessMatch = href.match(/[?&]accessToken=([^&]+)/);
      const refreshMatch = href.match(/[?&]refreshToken=([^&]+)/);
      if (accessMatch && accessMatch[1]) {
        const token = decodeURIComponent(accessMatch[1]);
        localStorage.setItem('token', token);
        if (refreshMatch && refreshMatch[1]) {
          localStorage.setItem(
            'refreshToken',
            decodeURIComponent(refreshMatch[1]),
          );
        }

        const cleaned = href
          .replace(/([?&])accessToken=[^&]*(&?)/, (_match, p1, p2) => {
            if (p1 === '?' && p2 === '&') return '?';
            return p2 ? p1 : '';
          })
          .replace(/([?&])refreshToken=[^&]*(&?)/, (_match, p1, p2) => {
            if (p1 === '?' && p2 === '&') return '?';
            return p2 ? p1 : '';
          })
          .replace(/[?&]$/, '');

        window.history.replaceState({}, '', cleaned);
        window.location.reload();
      }
    } catch {
      // ignore
    }

    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe().catch(() => {
        // Interceptor đã xử lý refresh + redirect khi cần
      });
    }
  }, []);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Toaster />
      <ColorThemeProvider>
        <PomodoroProvider>
          <Router>
            <AppContent />
          </Router>
        </PomodoroProvider>
      </ColorThemeProvider>
    </ThemeProvider>
  );
}

export default App;
