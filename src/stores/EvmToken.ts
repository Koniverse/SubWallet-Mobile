import { CustomEvmToken } from '@subwallet/extension-base/background/KoniTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EvmTokenSlice } from 'stores/types';

const initialState: EvmTokenSlice = { details: {} as Record<string, CustomEvmToken> };

const evmTokenSlice = createSlice({
  initialState,
  name: 'evmToken',
  reducers: {
    update(state, action: PayloadAction<EvmTokenSlice>) {
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

// export const { update: updateEvmToken } = evmTokenSlice.actions;
export default evmTokenSlice.reducer;
