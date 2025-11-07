import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Item = any;

const initialState = {
  items: [] as Item[]
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addFavourite(state, action: PayloadAction<Item>) {
      const exists = state.items.some(i => i.id === action.payload.id);
      if (!exists) state.items.push(action.payload);
    },
    removeFavourite(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    setFavourites(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
    }
  }
});

export const { addFavourite, removeFavourite, setFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
