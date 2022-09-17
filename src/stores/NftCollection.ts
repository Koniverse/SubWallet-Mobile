import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NftCollectionSlice } from 'stores/types';

const initialState: NftCollectionSlice = {
  ready: false,
  nftCollectionList: [],
};

const nftCollectionSlice = createSlice({
  initialState,
  name: 'nftCollection',
  reducers: {
    update(state, action: PayloadAction<NftCollectionSlice>) {
      const payload = action.payload;

      state.nftCollectionList = payload.nftCollectionList;
      state.ready = payload.ready;
    },
  },
});

export const { update } = nftCollectionSlice.actions;
export default nftCollectionSlice.reducer;
