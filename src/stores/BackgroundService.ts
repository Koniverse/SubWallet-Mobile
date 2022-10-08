import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackgroundServiceSlice } from 'stores/types';
import { ActiveCronAndSubscriptionMap } from '@subwallet/extension-base/background/KoniTypes';

const initialState: BackgroundServiceSlice = {
  activeState: {
    cron: {
      price: false,
      nft: false,
      staking: false,
      history: false,
      recoverApi: false,
      checkApiStatus: false,
    },
    subscription: {
      chainRegistry: false,
      balance: false,
      crowdloan: false,
      staking: false,
    },
  },
};

const backgroundServiceSlice = createSlice({
  initialState,
  name: 'backgroundService',
  reducers: {
    updateActiveState(state, action: PayloadAction<ActiveCronAndSubscriptionMap>) {
      state.activeState = action.payload;
    },
  },
});

export default backgroundServiceSlice.reducer;
