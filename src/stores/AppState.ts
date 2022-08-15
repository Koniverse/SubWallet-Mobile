import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AppStateSlice } from 'stores/types';

const initialState: AppStateSlice = {
  isLocked: false,
};

const appStateSlice = createSlice({
  initialState,
  name: 'appState',
  reducers: {
    updateLockState(state, action: PayloadAction<boolean>) {
      state.isLocked = action.payload;
    },
  },
});

export const { updateLockState } = appStateSlice.actions;
export default appStateSlice.reducer;
