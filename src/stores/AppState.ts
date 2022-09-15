import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AppStateSlice } from 'stores/types';

const initialState: AppStateSlice = {
  isLocked: false,
  isDisplayConfirmation: true,
};

const appStateSlice = createSlice({
  initialState,
  name: 'appState',
  reducers: {
    updateLockState(state, action: PayloadAction<boolean>) {
      state.isLocked = action.payload;
    },
    toggleConfirmationDisplayState(state) {
      state.isDisplayConfirmation = !state.isDisplayConfirmation;
    },
  },
});

export const { updateLockState } = appStateSlice.actions;
export default appStateSlice.reducer;
