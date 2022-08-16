import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { AccountsSlice } from 'stores/types';

const ACCOUNT_STORE_DEFAULT: AccountsSlice = {
  accounts: [],
  currentAccountAddress: ALL_ACCOUNT_KEY,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: ACCOUNT_STORE_DEFAULT,
  reducers: {
    update(state, action: PayloadAction<AccountsSlice>) {
      const newState = {
        ...action.payload,
      };

      if (action.payload.isReady === undefined) {
        newState.isReady = true;
      }

      return newState;
    },
    updateAccountsAndCurrentAccount(state, action: PayloadAction<AccountsSlice>) {
      const { accounts, currentAccountAddress, isReady, isWaiting } = action.payload;

      state.accounts = accounts;
      state.currentAccountAddress = currentAccountAddress;
      state.currentAccount = accounts.find(acc => acc.address === currentAccountAddress);

      if (isReady === undefined) {
        state.isReady = true;
      } else {
        state.isReady = isReady;
      }

      if (isWaiting === undefined) {
        state.isWaiting = false;
      } else {
        state.isWaiting = isWaiting;
      }
    },
    updateWaitingStatus(state, action: PayloadAction<boolean>) {
      state.isWaiting = action.payload;
    },
  },
});

export default accountsSlice.reducer;
