import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';

const PRICE_STORE_DEFAULT: PriceJson = {
  currency: 'usd',
  priceMap: {},
  tokenPriceMap: {},
  ready: false,
};

const priceSlice = createSlice({
  name: 'price',
  initialState: PRICE_STORE_DEFAULT,
  reducers: {
    updatePrice(state, action: PayloadAction<PriceJson>) {
      const payload = action.payload;
      state.currency = payload.currency;
      state.priceMap = payload.priceMap;
      state.tokenPriceMap = payload.tokenPriceMap;
      state.ready = payload.ready;
    },
  },
});

export const { updatePrice } = priceSlice.actions;
export default priceSlice.reducer;
