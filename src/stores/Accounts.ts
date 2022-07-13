import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';

const ACCOUNT_STORE_DEFAULT: {
  accounts: AccountJson[];
  currentAccountAddress: string;
  currentAccount?: AccountJson;
} = {
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
    upsertCurrentAccount(state, action: PayloadAction<AccountJson>) {
      state.currentAccountAddress = action.payload.address;
      const currentAccount = state.accounts.find(acc => acc.address === state.currentAccountAddress) as AccountJson;
      currentAccount.genesisHash = action.payload.genesisHash;
      state.currentAccount = currentAccount;
    },
  },
});

export const { updateAccounts, updateCurrentAccount, upsertCurrentAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
