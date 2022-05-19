import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountJson } from '@subwallet/extension-base/background/types';

const ACCOUNT_STORE_DEFAULT: {
  accounts: AccountJson[];
  currentAccountAddress: string;
  currentAccount?: AccountJson;
} = {
  accounts: [],
  currentAccountAddress: 'all',
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
  },
});

export const { updateAccounts, updateCurrentAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
