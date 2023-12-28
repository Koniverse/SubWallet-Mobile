// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { EarningRewardItem, YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import { ReduxStatus, EarningStore } from 'stores/types';

const initialState: EarningStore = {
  poolInfoMap: {},
  yieldPositions: [],
  reduxStatus: ReduxStatus.INIT,
  earningRewards: [],
};

const earningSlice = createSlice({
  initialState,
  name: 'earning',
  reducers: {
    updateYieldPoolInfo(state, action: PayloadAction<YieldPoolInfo[]>): EarningStore {
      const poolInfo: Record<string, YieldPoolInfo> = {};

      action.payload.forEach(yieldPool => {
        poolInfo[yieldPool.slug] = yieldPool;
      });

      return {
        ...state,
        poolInfoMap: poolInfo,
        reduxStatus: ReduxStatus.READY,
      };
    },
    updateYieldPositionInfo(state, action: PayloadAction<YieldPositionInfo[]>): EarningStore {
      return {
        ...state,
        yieldPositions: action.payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
    updateYieldReward(state, action: PayloadAction<EarningRewardItem[]>): EarningStore {
      return {
        ...state,
        earningRewards: action.payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { updateYieldPoolInfo, updateYieldPositionInfo, updateYieldReward } = earningSlice.actions;
export default earningSlice.reducer;
