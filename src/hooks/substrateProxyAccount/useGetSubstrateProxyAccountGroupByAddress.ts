// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetSubstrateProxyAccountGroup, SubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { getSubstrateProxyAccountGroup } from 'messaging/transaction/substrateProxy';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const DEFAULT_PROXY_ACCOUNTS: SubstrateProxyAccountGroup = {
  substrateProxyAccounts: [],
  substrateProxyDeposit: '0',
};

// React hook to fetch and manage Substrate proxy account groups for a given address and chain.
export function useGetSubstrateProxyAccountGroupByAddress(address: string, chain: string): SubstrateProxyAccountGroup {
  const [substrateProxyAccountGroup, setSubstrateProxyAccountGroup] =
    useState<SubstrateProxyAccountGroup>(DEFAULT_PROXY_ACCOUNTS);
  // Querying an inactive chain makes the backend throw on `getSubstrateApi(chain).isReady`,
  // and the fetch has to re-run once the chain does come online.
  const isChainActive = useSelector((state: RootState) => !!state.chainStore.chainStateMap[chain]?.active);

  const fetchSubstrateProxyAccountData = useCallback(
    async ({ isSync }: { isSync: boolean }) => {
      try {
        if (!address || !isChainActive) {
          if (isSync) {
            setSubstrateProxyAccountGroup(DEFAULT_PROXY_ACCOUNTS);
          }

          return;
        }

        const request: RequestGetSubstrateProxyAccountGroup = {
          chain,
          address,
        };

        const result = await getSubstrateProxyAccountGroup(request);

        if (isSync) {
          setSubstrateProxyAccountGroup(result);
        }
      } catch (e) {
        console.error('Error fetching proxy accounts:', e);

        if (isSync) {
          setSubstrateProxyAccountGroup(DEFAULT_PROXY_ACCOUNTS);
        }
      }
    },
    [address, chain, isChainActive],
  );

  useEffect(() => {
    const current = { isSync: true };

    fetchSubstrateProxyAccountData(current).catch(console.error);

    return () => {
      current.isSync = false;
    };
  }, [fetchSubstrateProxyAccountData]);

  return substrateProxyAccountGroup;
}

export default useGetSubstrateProxyAccountGroupByAddress;
