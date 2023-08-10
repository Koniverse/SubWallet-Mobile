import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionTypes } from '@walletconnect/types';
import { ReduxStatus, WalletConnectStore } from 'stores/types';

const initialState: WalletConnectStore = {
  sessions: {},
  reduxStatus: ReduxStatus.INIT,
};

const walletConnectSlice = createSlice({
  initialState,
  name: 'walletConnect',
  reducers: {
    updateSessions(state, action: PayloadAction<Record<string, SessionTypes.Struct>>) {
      const { payload } = action;

      return {
        sessions: payload,
        reduxStatus: ReduxStatus.READY,
      };
    },
  },
});

export const { updateSessions } = walletConnectSlice.actions;
export default walletConnectSlice.reducer;
