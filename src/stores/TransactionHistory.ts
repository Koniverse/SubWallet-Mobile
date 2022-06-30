import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { TransactionHistoryReducerType } from 'stores/types';

const initialState = { historyMap: {} } as TransactionHistoryReducerType;

const transactionHistorySlice = createSlice({
  initialState,
  name: 'transactionHistory',
  reducers: {
    update(state, action: PayloadAction<Record<string, TransactionHistoryItemType[]>>) {
      state.historyMap = action.payload;
    },
  },
});

export const { update: updateTransactionHistory } = transactionHistorySlice.actions;
export default transactionHistorySlice.reducer;
