import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AccountJson} from '@subwallet/extension-base/background/types';

const ACCOUNT_STORE_DEFAULT: {accounts: AccountJson[]; currentAccount: string} =
  {accounts: [], currentAccount: 'all'};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: ACCOUNT_STORE_DEFAULT,
  reducers: {
    updateAccounts(state, action: PayloadAction<AccountJson[]>) {
      state.accounts = action.payload;
    },
    updateCurrentAccount(state, action: PayloadAction<string>) {
      state.currentAccount = action.payload;
    },
  },
});

export const {updateAccounts, updateCurrentAccount} = accountsSlice.actions;
export default accountsSlice.reducer;
