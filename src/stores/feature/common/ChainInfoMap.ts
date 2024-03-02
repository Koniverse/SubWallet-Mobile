// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainStore } from 'stores/types';

const chainInfoMapSlice = createSlice({
  initialState: {} as ChainStore['chainInfoMap'],
  name: 'chainInfoMap',
  reducers: {
    updateChainInfoMap(state, action: PayloadAction<ChainStore['chainInfoMap']>) {
      const { payload } = action;

      return payload;
    },
  },
});

export const { updateChainInfoMap } = chainInfoMapSlice.actions;
export default chainInfoMapSlice.reducer;
