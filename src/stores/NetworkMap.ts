import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';

const initialState = {} as Record<string, NetworkJson>;

const networkMapSlice = createSlice({
  initialState,
  name: 'networkMap',
  reducers: {
    updateNetworkMap(state, action: PayloadAction<Record<string, NetworkJson>>) {
      return action.payload;
    },
  },
});

export const { updateNetworkMap } = networkMapSlice.actions;
export default networkMapSlice.reducer;
