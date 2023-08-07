// Copyright 2019-2023 Koniverse/SubWallet-mobile authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { enableChain } from 'messaging/index';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

enum ChainStatus {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}
export default function useChainChecker() {
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const connectingChain = useRef<string | null>(null);
  const [connectingChainStatus, setChainStatus] = useState<ChainStatus>(ChainStatus.NOT_CONNECTED);
  const { show } = useToast();

  useEffect(() => {
    if (
      connectingChainStatus === ChainStatus.CONNECTING &&
      connectingChain.current &&
      chainStateMap[connectingChain.current]?.connectionStatus === _ChainConnectionStatus.CONNECTED
    ) {
      const chainName = chainInfoMap[connectingChain.current].name;
      setTimeout(() => show(i18n.common.chainConnected(chainName), { type: 'success' }), 300);
      setChainStatus(ChainStatus.CONNECTED);
    }
  }, [chainInfoMap, chainStateMap, connectingChainStatus, show]);

  function checkChainConnected(chain: string) {
    connectingChain.current = chain;
    const chainState = chainStateMap[chain];

    if (!chainState) {
      // Couldn't get chain state
      return false;
    }

    if (!chainState.active) {
      // ChainStatus.NOT_CONNECTED
      return false;
    }

    if (chainState.connectionStatus === _ChainConnectionStatus.DISCONNECTED) {
      // ChainStatus.CONNECTED
      return true;
    }

    if (chainState.connectionStatus === _ChainConnectionStatus.CONNECTED) {
      // ChainStatus.CONNECTED
      return true;
    }
  }

  function turnOnChain(chain: string) {
    enableChain(chain, false)
      .then(() => {
        setChainStatus(ChainStatus.CONNECTING);
        connectingChain.current = chain;
        show(i18n.common.connecting, { type: 'warning' });
      })
      .catch(console.error);
  }

  return { turnOnChain, checkChainConnected };
}
