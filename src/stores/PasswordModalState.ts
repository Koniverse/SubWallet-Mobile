import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { PasswordModalSlice, SelectedActionType } from 'stores/types';

const initialState: PasswordModalSlice = {
  isShowModal: false,
  selectedAction: undefined,
};

const passwordModalSlice = createSlice({
  initialState,
  name: 'passwordModalState',
  reducers: {
    updatePasswordModalState(state, action: PayloadAction<boolean>) {
      state.isShowModal = action.payload;
    },
    updateSelectedAction(state, action: PayloadAction<SelectedActionType>) {
      state.selectedAction = action.payload;
    },
  },
});

export const { updatePasswordModalState, updateSelectedAction } = passwordModalSlice.actions;
export default passwordModalSlice.reducer;
