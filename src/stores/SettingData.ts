import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const SETTING_DATA_STORE_DEFAULT: {
  language: string;
} = {
  language: 'en',
};

const settingDataSlice = createSlice({
  name: 'accounts',
  initialState: SETTING_DATA_STORE_DEFAULT,
  reducers: {
    updateSettingData(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
  },
});

export const { updateSettingData } = settingDataSlice.actions;
export default settingDataSlice.reducer;
