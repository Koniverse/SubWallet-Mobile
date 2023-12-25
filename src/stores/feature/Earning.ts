// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import { ReduxStatus, EarningStore } from 'stores/types';

const initialState = {
  poolInfoMap: {},
  yieldPositions: [],
  reduxStatus: ReduxStatus.INIT,
} as EarningStore;

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
  },
});

export const { updateYieldPoolInfo, updateYieldPositionInfo } = earningSlice.actions;
export default earningSlice.reducer;
