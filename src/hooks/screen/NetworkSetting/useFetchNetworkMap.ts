// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNetworkMap() {
  const {
    accounts: { currentAccount },
    networkMap,
  } = useSelector((state: RootState) => state);

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

  return { parsedNetworkMap: sorted, isEthereum: currentAccount?.type === 'ethereum' };
}
