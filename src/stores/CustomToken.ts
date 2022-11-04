import { CustomTokenJson } from '@subwallet/extension-base/background/KoniTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomTokenSlice } from 'stores/types';

const initialState: CustomTokenSlice = {
  details: {
    erc721: [],
    erc20: [],
    psp22: [],
    psp34: [],
  } as CustomTokenJson,
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
