// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useEffect, useState } from 'react';

export default function useFetchNetworkMap() {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [sortedNetworkMap, setSortedNetworkMap] = useState<Record<string, NetworkJson>>({});

  useEffect(() => {
    const sorted = Object.entries(networkMap)
      .sort(([, defaultNetworkMap], [, _networkMap]) => {
        if (defaultNetworkMap.active && !_networkMap.active) {
          return -1;
        } else if (!defaultNetworkMap.active && _networkMap.active) {
          return 1;
        }

        return 0;
      })
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {}) as Record<string, NetworkJson>;
    setSortedNetworkMap(sorted);
  }, [networkMap]);

  return { parsedNetworkMap: sortedNetworkMap, isEthereum: currentAccount?.type === 'ethereum' };
}
