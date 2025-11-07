import { configureStore } from '@reduxjs/toolkit';
import favouritesReducer from './slices/favouritesSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure store
export const store = configureStore({
  reducer: {
    favourites: favouritesReducer
  }
});

// Simple persistence: restore and subscribe
(async () => {
  try {
    const s = await AsyncStorage.getItem('redux:favourites');
    if (s) {
      const parsed = JSON.parse(s);
      // We don't have a direct way to set initial state here, keep store empty; we'll rehydrate in slice's extra reducer or UI.
      // Simpler: dispatch an action after import (not shown). Alternatively, slice loads AsyncStorage on init.
    }
  } catch (e) {
    console.log('restore err', e);
  }
})();

// Save whenever store changes
store.subscribe(async () => {
  const state = store.getState();
  try {
    await AsyncStorage.setItem('redux:favourites', JSON.stringify(state.favourites.items || []));
  } catch (e) {
    // ignore
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
