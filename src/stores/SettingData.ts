import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SettingDataType = {
  language: string;
  pinCode: string;
};

const SETTING_DATA_STORE_DEFAULT: SettingDataType = {
  language: 'en',
  pinCode: '',
};

const settingDataSlice = createSlice({
  name: 'accounts',
  initialState: SETTING_DATA_STORE_DEFAULT,
  reducers: {
    updateLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    updatePinCode(state, action: PayloadAction<string>) {
      state.pinCode = action.payload;
    },
  },
});

export const { updateLanguage, updatePinCode } = settingDataSlice.actions;
export default settingDataSlice.reducer;
