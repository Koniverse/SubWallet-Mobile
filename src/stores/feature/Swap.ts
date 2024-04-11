import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReduxStatus, SwapStore } from 'stores/types';
import { SwapPair } from '@subwallet/extension-base/types/swap';

const initialState: SwapStore = {
  swapPairs: [],
  reduxStatus: ReduxStatus.INIT,
};

const swapSlice = createSlice({
  initialState,
  name: 'swap',
  reducers: {
    updateSwapPairs(state, action: PayloadAction<SwapPair[]>): SwapStore {
      return {
        ...state,
        swapPairs: action.payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { updateSwapPairs } = swapSlice.actions;
export default swapSlice.reducer;
