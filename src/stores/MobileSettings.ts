import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LockTimeout, MobileSettingsSlice } from 'stores/types';

const MOBILE_SETTINGS_STORE_DEFAULT: MobileSettingsSlice = {
  language: 'en',
  pinCodeEnabled: false,
  faceIdEnabled: false, // deprecated
  isUseBiometric: false,
  isPreventLock: false,
  timeAutoLock: LockTimeout._15MINUTE,
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
    updateFaceIdEnable(state, action: PayloadAction<boolean>) {
      state.faceIdEnabled = action.payload;
    },
    updateUseBiometric(state, action: PayloadAction<boolean>) {
      state.isUseBiometric = action.payload;
    },
    updateAutoLockTime(state, action: PayloadAction<number | undefined>) {
      state.timeAutoLock = action.payload;
    },
    updatePreventLock(state, action: PayloadAction<boolean>) {
      state.isPreventLock = action.payload;
    },
  },
});

export const { updateLanguage, updateFaceIdEnable, updateUseBiometric, updateAutoLockTime, updatePreventLock } =
  mobileSettingsSlice.actions;
export default mobileSettingsSlice.reducer;
