import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrowserSlice, BrowserSliceTab, SiteInfo } from 'stores/types';

const initialState: BrowserSlice = {
  activeTab: null,
  tabs: [],
  whitelist: [],
  history: [],
  bookmarks: [],
};

function generateId(prefix?: string): string {
  return `${prefix ? prefix + '-' : ''}${Date.now()}`;
}

const browserSlice = createSlice({
  initialState,
  name: 'browser',
  reducers: {
    updateActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    createNewTab: (state, { payload: url }: PayloadAction<string>) => {
      state.tabs = [...state.tabs, { url, id: generateId('tab') }];
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
    addToHistory: (state, { payload }: PayloadAction<SiteInfo>) => {
      if (!state.history.length || state.history[0].url !== payload.url) {
        state.history = [{ ...payload, id: generateId('his') }, ...state.history].slice(0, 50); //max 50 items
      }
    },
    clearHistory: state => {
      state.history = [];
    },
    addBookmark: (state, { payload }: PayloadAction<SiteInfo>) => {
      if (!state.bookmarks.some(s => s.url === payload.url)) {
        state.bookmarks = [{ ...payload, id: generateId('bm') }, ...state.bookmarks];
      }
    },
    removeBookmark: (state, { payload }: PayloadAction<SiteInfo>) => {
      state.bookmarks = state.bookmarks.filter(t => t.url !== payload.url);
    },
  },
});

export default browserSlice.reducer;
