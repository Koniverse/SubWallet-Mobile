import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MobileSettingsType = {
  language: string;
  pinCode: string;
  pinCodeEnabled: boolean;
  autoLockTime: number | undefined;
};

const MOBILE_SETTINGS_STORE_DEFAULT: MobileSettingsType = {
  language: 'en',
  pinCode: '',
  pinCodeEnabled: false,
  autoLockTime: undefined,
};

const mobileSettingsSlice = createSlice({
  name: 'mobileSettings',
  initialState: MOBILE_SETTINGS_STORE_DEFAULT,
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

export const { updateLanguage, updatePinCode, updatePinCodeEnable, updateAutoLockTime } = mobileSettingsSlice.actions;
export default mobileSettingsSlice.reducer;
