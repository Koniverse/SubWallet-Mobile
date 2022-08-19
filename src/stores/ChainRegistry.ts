import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainRegistrySlice } from 'stores/types';

const initialState: ChainRegistrySlice = { details: {} };

const chainRegistrySlice = createSlice({
  initialState,
  name: 'chainRegistry',
  reducers: {
    update(state, action: PayloadAction<ChainRegistrySlice>) {
      state.details = Object.assign(state.details, action.payload.details);

      if (action.payload.isReady === undefined) {
        state.isReady = true;
      }
    },
  },
});

export default chainRegistrySlice.reducer;
