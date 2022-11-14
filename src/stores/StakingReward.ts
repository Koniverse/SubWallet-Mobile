import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StakingRewardSlice } from 'stores/types';

const initialState: StakingRewardSlice = {
  details: [],
  ready: false,
};

const stakingRewardSlice = createSlice({
  initialState,
  name: 'stakingReward',
  reducers: {
    update(state, action: PayloadAction<StakingRewardSlice>) {
      const payload = action.payload;

      state.details = payload.details;
      state.ready = payload.ready;
    },
  },
});

export const { update } = stakingRewardSlice.actions;
export default stakingRewardSlice.reducer;
