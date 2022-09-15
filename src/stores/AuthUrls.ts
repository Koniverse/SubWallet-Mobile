import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { AuthUrlsSlice } from 'stores/types';

const initialState: AuthUrlsSlice = {
  details: {},
};

const authUrlsSlice = createSlice({
  initialState,
  name: 'authUrls',
  reducers: {
    update(state, action: PayloadAction<AuthUrlsSlice>) {
      const newState = {
        ...action.payload,
      };

      if (action.payload.isReady === undefined) {
        newState.isReady = true;
      }

      return newState;
    },
  },
});

export default authUrlsSlice.reducer;
