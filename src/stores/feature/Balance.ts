// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { BalanceStore, ReduxStatus } from 'stores/types';
import { BalanceMap } from '@subwallet/extension-base/types';

const initialState: BalanceStore = {
  balanceMap: {},
  reduxStatus: ReduxStatus.INIT,
};

const balanceSlice = createSlice({
  initialState,
  name: 'balance',
  reducers: {
    update(state, action: PayloadAction<BalanceMap>) {
      const payload = action.payload;

      return {
        balanceMap: { ...payload },
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { update } = balanceSlice.actions;
export default balanceSlice.reducer;
