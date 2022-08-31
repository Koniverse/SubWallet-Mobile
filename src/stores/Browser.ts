import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrowserSlice, BrowserSliceTab, SiteInfo } from 'stores/types';

const initialState: BrowserSlice = {
  activeTab: null,
  tabs: [],
  whitelist: [],
  history: [],
  bookmarks: [],
};

function generateTabId(): string {
  return `tab-${Date.now()}`;
}

const browserSlice = createSlice({
  initialState,
  name: 'browser',
  reducers: {
    updateActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    createNewTab: (state, { payload: url }: PayloadAction<string>) => {
      state.tabs = [...state.tabs, { url, id: generateTabId() }];
    },
    closeTab: (state, { payload: id }: PayloadAction<string>) => {
      state.tabs = state.tabs.filter(t => t.id !== id);
    },
    updateTab: (state, { payload }: PayloadAction<BrowserSliceTab>) => {
      state.tabs = [
        ...state.tabs.map(t => {
          if (t.id === payload.id) {
            return { ...payload };
          }

          return t;
        }),
      ];
    },
    addBookmark: (state, { payload }: PayloadAction<SiteInfo>) => {
      state.bookmarks = [...state.bookmarks, payload];
    },
    removeBookmark: (state, { payload }: PayloadAction<SiteInfo>) => {
      state.bookmarks = state.bookmarks.filter(t => t.url !== payload.url);
    },
  },
});

export default browserSlice.reducer;
