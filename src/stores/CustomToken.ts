import { CustomToken } from '@subwallet/extension-base/background/KoniTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomTokenSlice } from 'stores/types';

const initialState: CustomTokenSlice = { details: {} as Record<string, CustomToken> };

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
