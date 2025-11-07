import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setFavourites } from './slices/favouritesSlice';
import { Slot } from 'expo-router';

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
      <Slot />
    </Provider>
  );
}
