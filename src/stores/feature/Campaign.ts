import { CampaignStore, ReduxStatus } from 'stores/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';

const initialState: CampaignStore = {
  banners: [],
  reduxStatus: ReduxStatus.INIT,
};

const campaignSlice = createSlice({
  initialState,
  name: 'campaign',
  reducers: {
    updateBanner(state, action: PayloadAction<CampaignBanner[]>) {
      return {
        ...state,
        banners: action.payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { updateBanner } = campaignSlice.actions;
export default campaignSlice.reducer;
