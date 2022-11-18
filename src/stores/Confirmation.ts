import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConfirmationSlice } from 'stores/types';

const initialState: ConfirmationSlice = {
  details: {},
};

const confirmationSlice = createSlice({
  initialState,
  name: 'confirmation',
  reducers: {
    updateReady(state, action: PayloadAction<ConfirmationSlice['isReady']>) {
      state.isReady = action.payload;
    },
    updateConfirmations(state, action: PayloadAction<ConfirmationSlice['details']>) {
      Object.assign(state.details, action.payload);
      if (!state.isReady) {
        if (
          state.details.authorizeRequest &&
          state.details.metadataRequest &&
          state.details.signingRequest &&
          state.details.evmSignatureRequest &&
          state.details.evmSignatureRequestExternal &&
          state.details.evmSendTransactionRequest &&
          state.details.evmSendTransactionRequestExternal
        ) {
          state.isReady = true;
        }
      }
    },
  },
});

export const { updateConfirmations } = confirmationSlice.actions;
export default confirmationSlice.reducer;
