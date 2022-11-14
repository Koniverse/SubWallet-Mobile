import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StakeUnlockingSlice } from 'stores/types';

const initialState: StakeUnlockingSlice = {
  timestamp: 0,
  details: [],
};

const stakeUnlockingSlice = createSlice({
  initialState,
  name: 'stakeUnlockingInfo',
  reducers: {
    update(state, action: PayloadAction<StakeUnlockingSlice>) {
      const payload = action.payload;

      state.timestamp = payload.timestamp;
      state.details = payload.details;
    },
  },
});

export const { update } = stakeUnlockingSlice.actions;
export default stakeUnlockingSlice.reducer;
