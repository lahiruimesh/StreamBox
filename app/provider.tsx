import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot } from 'expo-router';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { setFavourites } from './slices/favouritesSlice';
import { store } from './store';
import { ThemeProvider } from './ThemeProvider';

export default function ProviderApp() {
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('redux:favourites');
        if (s) {
          const parsed = JSON.parse(s);
          store.dispatch(setFavourites(parsed));
        }
      } catch (e) {
        console.log('rehydrate err', e);
      }
    })();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </Provider>
  );
}
