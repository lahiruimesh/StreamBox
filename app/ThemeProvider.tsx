import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeContextType = {
  theme: ColorSchemeName;
  setTheme: (t: ColorSchemeName | 'system') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');
  const [mode, setMode] = useState<ColorSchemeName | 'system'>('system');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('app:theme');
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
          setThemeState(stored);
        } else {
          setMode('system');
          setThemeState(Appearance.getColorScheme() ?? 'light');
        }
      } catch (e) {
        // ignore
      }
    })();

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        setThemeState(colorScheme ?? 'light');
      }
    });

    return () => sub.remove();
  }, [mode]);

  const setTheme = async (t: ColorSchemeName | 'system') => {
    setMode(t);
    if (t === 'system') {
      const sys = Appearance.getColorScheme() ?? 'light';
      setThemeState(sys);
      await AsyncStorage.removeItem('app:theme');
    } else {
      const val = t ?? 'light';
      setThemeState(val as ColorSchemeName);
      await AsyncStorage.setItem('app:theme', val);
    }
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Safe hook that returns undefined when used outside the provider (useful for shared libs)
export function useThemeSafe() {
  return useContext(ThemeContext);
}
