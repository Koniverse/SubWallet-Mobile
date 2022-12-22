import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StakingRewardSlice } from 'stores/types';
import { StakingRewardJson } from '@subwallet/extension-base/background/KoniTypes';

const initialState: StakingRewardSlice = {
  details: [],
  ready: false,
};

const stakingRewardSlice = createSlice({
  initialState,
  name: 'stakingReward',
  reducers: {
    update(state, action: PayloadAction<StakingRewardJson>) {
      const payload = action.payload;

      state.details = [...payload.slowInterval, ...payload.fastInterval];
      state.ready = payload.ready;
    },
  },
});

export const { update } = stakingRewardSlice.actions;
export default stakingRewardSlice.reducer;
