import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PriceSlice } from 'stores/types';

const PRICE_STORE_DEFAULT: PriceSlice = {
  currency: 'usd',
  priceMap: {},
  tokenPriceMap: {},
};

const priceSlice = createSlice({
  name: 'price',
  initialState: PRICE_STORE_DEFAULT,
  reducers: {
    update(state, action: PayloadAction<PriceSlice>) {
      const newState = {
        ...action.payload,
      };

      if (action.payload.isReady === undefined) {
        newState.isReady = true;
      }

      return newState;
    },
  },
});

export default priceSlice.reducer;
