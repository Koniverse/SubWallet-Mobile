import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MissionPoolStore, ReduxStatus } from 'stores/types';

const initialState: MissionPoolStore = {
  missions: [],
  reduxStatus: ReduxStatus.INIT,
};

const missionPoolSlice = createSlice({
  initialState,
  name: 'missionPool',
  reducers: {
    update(state, action: PayloadAction<MissionPoolStore>) {
      const { payload } = action;

      const reduxStatus = payload.reduxStatus || ReduxStatus.READY;

      return {
        ...payload,
        reduxStatus,
      };
    },
  },
});

export default missionPoolSlice.reducer;
