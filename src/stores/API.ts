import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DAppInfo, DAPPCategory } from 'types/browser';

export const browserDAPPs = createApi({
  reducerPath: 'dApps',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://static-data.subwallet.app' }),
  endpoints: builder => ({
    getDAPPs: builder.query<DAppInfo[], undefined>({
      query: () => 'dapps/list.json',
    }),
    getDAPPCategories: builder.query<DAPPCategory[], undefined>({
      query: () => 'categories/list.json',
    }),
  }),
});

export const { useGetDAPPsQuery, useGetDAPPCategoriesQuery } = browserDAPPs;
