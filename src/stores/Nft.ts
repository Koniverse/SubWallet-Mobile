import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NftSlice } from 'stores/types';

const initialState: NftSlice = {
  total: 0,
  nftList: [],
};

const nftSlice = createSlice({
  initialState,
  name: 'nft',
  reducers: {
    update(state, action: PayloadAction<NftSlice>) {
      const payload = action.payload;

      state.total = payload.total;
      state.nftList = payload.nftList;
    },
  },
});

export const { update } = nftSlice.actions;
export default nftSlice.reducer;
