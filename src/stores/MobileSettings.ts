import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MobileSettingsSlice } from 'stores/types';

const MOBILE_SETTINGS_STORE_DEFAULT: MobileSettingsSlice = {
  language: 'en',
  pinCode: '',
  pinCodeEnabled: false,
  autoLockTime: undefined,
  isReady: true, // always true
};

const mobileSettingsSlice = createSlice({
  name: 'mobileSettings',
  initialState: MOBILE_SETTINGS_STORE_DEFAULT,
  reducers: {
    update(state, action: PayloadAction<MobileSettingsSlice>) {
      const newState = {
        ...action.payload,
      };

      if (action.payload.isReady === undefined) {
        newState.isReady = true;
      }

      return newState;
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
    updateAutoLockTime(state, action: PayloadAction<number | undefined>) {
      state.autoLockTime = action.payload;
    },
  },
});

export const { updateLanguage, updatePinCode, updatePinCodeEnable, updateAutoLockTime } = mobileSettingsSlice.actions;
export default mobileSettingsSlice.reducer;
