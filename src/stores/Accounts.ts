import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { AccountsStoreType } from 'stores/types';

const ACCOUNT_STORE_DEFAULT: AccountsStoreType = {
  accounts: [],
  currentAccountAddress: ALL_ACCOUNT_KEY,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: ACCOUNT_STORE_DEFAULT,
  reducers: {
    updateAccounts(state, action: PayloadAction<AccountJson[]>) {
      state.accounts = action.payload;
    },
    updateCurrentAccount(state, action: PayloadAction<string>) {
      state.currentAccountAddress = action.payload;
      state.currentAccount = state.accounts.find(acc => acc.address === state.currentAccountAddress);
    },
    updateAccountsAndCurrentAccount(state, action: PayloadAction<AccountsStoreType>) {
      const { accounts, currentAccountAddress } = action.payload;

      state.accounts = accounts;
      state.currentAccountAddress = currentAccountAddress;
      state.currentAccount = accounts.find(acc => acc.address === currentAccountAddress);
    },
    upsertCurrentAccount(state, action: PayloadAction<AccountJson>) {
      state.currentAccountAddress = action.payload.address;
      state.currentAccount = action.payload;
    },
  },
});

export const { updateAccounts, updateCurrentAccount, updateAccountsAndCurrentAccount, upsertCurrentAccount } =
  accountsSlice.actions;
export default accountsSlice.reducer;
