import {configureStore} from '@reduxjs/toolkit';
import accountsReducer from './Accounts';
import priceReducer from './Price';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    price: priceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
