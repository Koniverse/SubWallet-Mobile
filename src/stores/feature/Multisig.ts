// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PendingMultisigTxMap } from '@subwallet/extension-base/services/multisig-service';
import { MultisigStore, ReduxStatus } from 'stores/types';

const initialState: MultisigStore = {
  reduxStatus: ReduxStatus.INIT,
  pendingMultisigTxs: {},
};

const multisigSlice = createSlice({
  initialState,
  name: 'multisig',
  reducers: {
    updatePendingMultisigTxs(state, action: PayloadAction<PendingMultisigTxMap>): MultisigStore {
      return {
        ...state,
        pendingMultisigTxs: action.payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { updatePendingMultisigTxs } = multisigSlice.actions;
export default multisigSlice.reducer;
