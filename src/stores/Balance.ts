import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { BalanceSlice } from 'stores/types';

const initialState: BalanceSlice = {
  details: {},
};

const balanceSlice = createSlice({
  initialState,
  name: 'balance',
  reducers: {
    update(state, action: PayloadAction<BalanceSlice>) {
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

export default balanceSlice.reducer;
