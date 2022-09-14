import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransferNftParamsSlice } from './types';

const initialState = {
  nftItem: {},
} as TransferNftParamsSlice;

const transferNftParamsSlice = createSlice({
  initialState,
  name: 'transferNftParams',
  reducers: {
    update(state, action: PayloadAction<TransferNftParamsSlice>) {
      const payload = action.payload;

      state.nftItem = payload.nftItem;
      state.collectionImage = payload.collectionImage;
      state.collectionId = payload.collectionId;
    },
  },
});

export const { update } = transferNftParamsSlice.actions;
export default transferNftParamsSlice.reducer;
