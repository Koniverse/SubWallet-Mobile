import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountJson } from '@subwallet/extension-base/background/types';
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
    updateAccounts(state, action: PayloadAction<AccountJson[]>) {
      state.accounts = action.payload;

      if (!state.isReady) {
        state.isReady = true;
      }
    },
    updateCurrentAccount(state, action: PayloadAction<string>) {
      state.currentAccountAddress = action.payload;
      state.currentAccount = state.accounts.find(acc => acc.address === state.currentAccountAddress);

      if (!state.isReady) {
        state.isReady = true;
      }
    },
    updateAccountsAndCurrentAccount(state, action: PayloadAction<AccountsSlice>) {
      const { accounts, currentAccountAddress, isReady } = action.payload;

      state.accounts = accounts;
      state.currentAccountAddress = currentAccountAddress;
      state.currentAccount = accounts.find(acc => acc.address === currentAccountAddress);

      if (isReady === undefined) {
        state.isReady = true;
      } else {
        state.isReady = isReady;
      }
    },
    upsertCurrentAccount(state, action: PayloadAction<AccountJson>) {
      state.currentAccountAddress = action.payload.address;
      state.currentAccount = action.payload;

      if (!state.isReady) {
        state.isReady = true;
      }
    },
  },
});

export const { updateAccounts, updateCurrentAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
