import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkMapSlice } from 'stores/types';

const initialState: NetworkMapSlice = { details: {} };

const networkMapSlice = createSlice({
  initialState,
  name: 'networkMap',
  reducers: {
    update(state, action: PayloadAction<NetworkMapSlice>) {
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

export default networkMapSlice.reducer;
