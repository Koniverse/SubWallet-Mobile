import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AppVersionSlice } from 'stores/types';

const initialState: AppVersionSlice = {
  buildNumber: 1,
};

const appVersion = createSlice({
  initialState,
  name: 'appVersion',
  reducers: {
    setBuildNumber(state, action: PayloadAction<number>) {
      state.buildNumber = action.payload;
    },
  },
});

export const { setBuildNumber } = appVersion.actions;
export default appVersion.reducer;
