// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { BalanceItem } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceStore, ReduxStatus } from 'stores/types';

const initialState: BalanceStore = {
  balanceMap: {},
  reduxStatus: ReduxStatus.INIT,
};

const balanceSlice = createSlice({
  initialState,
  name: 'balance',
  reducers: {
    update(state, action: PayloadAction<Record<string, BalanceItem>>) {
      const data = action.payload;
      if (Object.values(data || {}).length === 0) {
        return;
      }

      return {
        balanceMap: data,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { update } = balanceSlice.actions;
export default balanceSlice.reducer;
