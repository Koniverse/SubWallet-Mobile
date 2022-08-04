// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NETWORK_STATUS, NetWorkGroup } from '@subwallet/extension-base/background/KoniTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getKnownHashes } from 'utils/defaultChains';

export interface NetworkSelectOption {
  text: string;
  value: string;
  networkKey: string;
  networkPrefix: number;
  icon: string;
  groups: NetWorkGroup[];
  isEthereum: boolean;
  active: boolean;
  apiStatus: NETWORK_STATUS;
}

const RELAY_CHAIN = 'Relay Chain';

export default function (): NetworkSelectOption[] {
  const { networkMap } = useSelector((state: RootState) => state);
  const dep = JSON.stringify(networkMap);

  return useMemo(() => {
    const parsedChains = _getKnownHashes(networkMap);
    const availableChains = parsedChains.filter(c => c.isAvailable);

    return [
      {
        text: 'Allow use on any chain',
        value: '',
        networkKey: 'all',
        networkPrefix: -1,
        icon: 'polkadot',
        groups: ['UNKNOWN'] as NetWorkGroup[],
        isEthereum: false,
        active: true,
        apiStatus: NETWORK_STATUS.DISCONNECTED,
      },
      // put the relay chains at the top
      ...availableChains
        .filter(({ chain }) => chain.includes(RELAY_CHAIN))
        .map(({ active, apiStatus, chain, genesisHash, groups, icon, isEthereum, networkKey, ss58Format }) => ({
          text: chain,
          value: genesisHash,
          networkPrefix: ss58Format,
          networkKey,
          icon,
          groups,
          isEthereum,
          active,
          apiStatus,
        })),
      ...availableChains
        .map(({ active, apiStatus, chain, genesisHash, groups, icon, isEthereum, networkKey, ss58Format }) => ({
          text: chain,
          value: genesisHash,
          networkPrefix: ss58Format,
          networkKey,
          icon,
          groups,
          isEthereum,
          active,
          apiStatus,
        }))
        // remove the relay chains, they are at the top already
        .filter(({ text }) => !text.includes(RELAY_CHAIN))
        .sort((a, b) => a.text.localeCompare(b.text)),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
}
