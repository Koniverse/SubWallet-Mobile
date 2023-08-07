import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MobileSettingsSlice } from 'stores/types';

const MOBILE_SETTINGS_STORE_DEFAULT: MobileSettingsSlice = {
  language: 'en',
  pinCode: '',
  pinCodeEnabled: false,
  faceIdEnabled: false,
  isPreventLock: false,
  autoLockTime: 15 * 1000,
};

const mobileSettingsSlice = createSlice({
  name: 'mobileSettings',
  initialState: MOBILE_SETTINGS_STORE_DEFAULT,
  reducers: {
    update(state, action: PayloadAction<MobileSettingsSlice>) {
      return {
        ...action.payload,
      };
    },
    updateLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    updatePinCode(state, action: PayloadAction<string>) {
      state.pinCode = action.payload;
    },
    updatePinCodeEnable(state, action: PayloadAction<boolean>) {
      state.pinCodeEnabled = action.payload;
    },
    updateFaceIdEnable(state, action: PayloadAction<boolean>) {
      state.faceIdEnabled = action.payload;
    },
    updateAutoLockTime(state, action: PayloadAction<number | undefined>) {
      state.autoLockTime = action.payload;
    },
    updatePreventLock(state, action: PayloadAction<boolean>) {
      state.isPreventLock = action.payload;
    },
  },
});

export const {
  updateLanguage,
  updatePinCode,
  updatePinCodeEnable,
  updateFaceIdEnable,
  updateAutoLockTime,
  updatePreventLock,
} = mobileSettingsSlice.actions;
export default mobileSettingsSlice.reducer;
