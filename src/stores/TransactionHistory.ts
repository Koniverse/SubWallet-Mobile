import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionHistorySlice } from 'stores/types';

const initialState: TransactionHistorySlice = { details: {} };

const transactionHistorySlice = createSlice({
  initialState,
  name: 'transactionHistory',
  reducers: {
    update(state, action: PayloadAction<TransactionHistorySlice>) {
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

export default transactionHistorySlice.reducer;
