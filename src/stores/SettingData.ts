import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SettingDataType = {
  language: string;
  pinCode: string;
  pinCodeEnabled: boolean;
  autoLockTime: number | undefined;
};

const SETTING_DATA_STORE_DEFAULT: SettingDataType = {
  language: 'en',
  pinCode: '',
  pinCodeEnabled: false,
  autoLockTime: undefined,
};

const settingDataSlice = createSlice({
  name: 'settingData',
  initialState: SETTING_DATA_STORE_DEFAULT,
  reducers: {
    updateLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    updatePinCode(state, action: PayloadAction<string>) {
      state.pinCode = action.payload;
    },
    updatePinCodeEnable(state, action: PayloadAction<boolean>) {
      state.pinCodeEnabled = action.payload;
    },
    updateAutoLockTime(state, action: PayloadAction<number | undefined>) {
      state.autoLockTime = action.payload;
    },
  },
});

export const { updateLanguage, updatePinCode, updatePinCodeEnable, updateAutoLockTime } = settingDataSlice.actions;
export default settingDataSlice.reducer;
