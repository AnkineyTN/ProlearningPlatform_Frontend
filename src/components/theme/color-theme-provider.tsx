import { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'atlas' | 'lumen' | 'ember';

const STORAGE_KEY = 'pl-color-theme';

type ColorThemeContextValue = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
};

const ColorThemeContext = createContext<ColorThemeContextValue>({
  colorTheme: 'atlas',
  setColorTheme: () => null,
});

export function ColorThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(
    () => (localStorage.getItem(STORAGE_KEY) as ColorTheme) || 'atlas',
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    setColorThemeState(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorTheme() {
  const ctx = useContext(ColorThemeContext);
  if (!ctx)
    throw new Error('useColorTheme must be used inside ColorThemeProvider');
  return ctx;
}
