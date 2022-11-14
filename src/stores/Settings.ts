// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { SettingsSlice } from 'stores/types';

const initialState: SettingsSlice = {
  isShowBalance: false,
  accountAllLogo: '',
  theme: 'dark',
};

const settingsSlice = createSlice({
  initialState,
  name: 'settings',
  reducers: {
    update(state, action: PayloadAction<SettingsSlice>) {
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

export default settingsSlice.reducer;
