import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { STATIC_DATA_DOMAIN } from 'constants/index';
import { DAppInfo, DAppCategory } from 'types/browser';
import { TokenConfig } from 'types/tokenConfig';

const baseQuery = fetchBaseQuery({ baseUrl: STATIC_DATA_DOMAIN });

export const browserDAPPs = createApi({
  reducerPath: 'dApps',
  baseQuery,
  endpoints: builder => ({
    getDAPPs: builder.query<DAppInfo[], undefined>({
      query: () => 'dapps/list.json',
    }),
    getDAPPCategories: builder.query<DAppCategory[], undefined>({
      query: () => 'categories/list.json',
    }),
  }),
});

export const tokenConfig = createApi({
  reducerPath: 'tokenConfig',
  baseQuery,
  endpoints: builder => ({
    getTokenConfig: builder.query<TokenConfig, undefined>({
      query: () => 'tokens/config.json',
    }),
  }),
});

export const { useGetDAPPsQuery, useGetDAPPCategoriesQuery } = browserDAPPs;
export const { useGetTokenConfigQuery } = tokenConfig;
