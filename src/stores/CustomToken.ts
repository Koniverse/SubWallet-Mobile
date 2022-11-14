import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomTokenType } from '@subwallet/extension-base/background/KoniTypes';
import { CustomTokenSlice } from 'stores/types';

const initialState: CustomTokenSlice = {
  details: {
    [CustomTokenType.erc721]: [],
    [CustomTokenType.erc20]: [],
    [CustomTokenType.psp22]: [],
    [CustomTokenType.psp34]: [],
  },
};

const customTokenSlice = createSlice({
  initialState,
  name: 'customToken',
  reducers: {
    update(state, action: PayloadAction<CustomTokenSlice>) {
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

export default customTokenSlice.reducer;
