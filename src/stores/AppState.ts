import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AppStateSlice } from 'stores/types';

const initialState: AppStateSlice = {
  isLocked: false,
  isDisplayConfirmation: true,
  isDisplayMktCampaign: false,
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
    updateMktCampaignStatus(state, action: PayloadAction<boolean>) {
      state.isDisplayMktCampaign = action.payload;
    },
  },
});

export const { updateLockState, updateMktCampaignStatus } = appStateSlice.actions;
export default appStateSlice.reducer;
