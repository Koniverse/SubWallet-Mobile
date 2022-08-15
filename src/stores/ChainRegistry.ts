import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainRegistrySlice } from 'stores/types';

const initialState: ChainRegistrySlice = { details: {} };

const chainRegistrySlice = createSlice({
  initialState,
  name: 'chainRegistry',
  reducers: {
    update(state, action: PayloadAction<ChainRegistrySlice>) {
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

export default chainRegistrySlice.reducer;
