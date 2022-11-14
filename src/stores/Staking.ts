import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StakingSlice } from 'stores/types';

const initialState: StakingSlice = {
  ready: false,
  details: [],
};

const stakingSlice = createSlice({
  initialState,
  name: 'staking',
  reducers: {
    update(state, action: PayloadAction<StakingSlice>) {
      const payload = action.payload;

      if (payload.ready !== undefined) {
        state.ready = payload.ready;
      }

      state.details = payload.details;
    },
  },
});

export const { update } = stakingSlice.actions;
export default stakingSlice.reducer;
