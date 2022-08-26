import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CrowdloanSlice } from 'stores/types';

const initialState: CrowdloanSlice = {
  details: {},
};

const crowdloanSlice = createSlice({
  initialState,
  name: 'crowdloan',
  reducers: {
    update(state, action: PayloadAction<CrowdloanSlice>) {
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

export const { update } = crowdloanSlice.actions;
export default crowdloanSlice.reducer;
