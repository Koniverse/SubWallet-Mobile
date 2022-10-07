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
    updateActiveTab: (state, action: PayloadAction<BrowserSlice['activeTab']>) => {
      state.activeTab = action.payload;
    },
    createNewTab: (state, { payload: url }: PayloadAction<string>) => {
      const id = generateId('tab');

      state.activeTab = id;
      state.tabs = [...state.tabs, { url, id }];
    },
    createNewTabIfEmpty: (state, { payload: url }: PayloadAction<string>) => {
      if (!state.tabs.length) {
        const id = generateId('tab');

        state.activeTab = id;
        state.tabs = [...state.tabs, { url, id }];
      }
    },
    closeTab: (state, { payload: id }: PayloadAction<string>) => {
      const targetTabIndex = state.tabs.findIndex(t => t.id === id);

      if (targetTabIndex < 0) {
        return state;
      }

      const tabsLength = state.tabs.length;

      if (tabsLength > 1) {
        if (id === state.activeTab) {
          if (targetTabIndex === tabsLength - 1) {
            state.activeTab = state.tabs[tabsLength - 2].id;
          } else {
            state.activeTab = state.tabs[targetTabIndex + 1].id;
          }
        }

        state.tabs = state.tabs.filter(t => t.id !== id);
      } else {
        state.activeTab = null;
        state.tabs = [];
      }
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
    updateTabScreenshot: (
      state,
      { payload: { id, screenshot } }: PayloadAction<{ id: string; screenshot: string }>,
    ) => {
      state.tabs = [
        ...state.tabs.map(t => {
          if (t.id === id) {
            return { ...t, screenshot };
          }

          return t;
        }),
      ];
    },
    clearAllTabScreenshots: state => {
      state.tabs = state.tabs.map(t => ({
        ...t,
        screenshot: undefined,
      }));
    },
    closeAllTab: state => {
      state.activeTab = null;
      state.tabs = [];
    },
    addToHistory: (state, { payload }: PayloadAction<SiteInfo>) => {
      if (!state.history.length || state.history[0].url !== payload.url) {
        state.history = [{ ...payload, id: generateId('his') }, ...state.history].slice(0, 50); //max 50 items
      }
    },
    updateLatestItemInHistory: (state, { payload }: PayloadAction<SiteInfo>) => {
      if (state.history[0]) {
        const firstItem = state.history[0];
        state.history.shift();

        state.history = [{ ...firstItem, ...payload }, ...state.history];
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
