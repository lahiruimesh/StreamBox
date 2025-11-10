// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './ThemeProvider';

export default function Layout() {
  return (
    // initialRouteName makes the starting screen explicit
    <ReduxProvider store={store}>
      <ThemeProvider>
        <Stack initialRouteName="welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </ReduxProvider>
  );
}
