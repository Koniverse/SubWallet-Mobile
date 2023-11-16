// Copyright 2019-2023 Koniverse/SubWallet-mobile authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { enableChain } from 'messaging/index';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

export default function useChainChecker() {
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const connectingChain = useRef<string | null>(null);
  const [connectingChainStatus, setChainStatus] = useState<_ChainConnectionStatus>(_ChainConnectionStatus.DISCONNECTED);
  const { show } = useToast();

  useEffect(() => {
    if (
      connectingChainStatus === _ChainConnectionStatus.CONNECTING &&
      connectingChain.current &&
      chainStateMap[connectingChain.current]?.connectionStatus === _ChainConnectionStatus.CONNECTED
    ) {
      const chainName = chainInfoMap[connectingChain.current].name;
      setTimeout(
        () => show(i18n.formatString(i18n.common.chainConnected, chainName) as string, { type: 'success' }),
        300,
      );
      setChainStatus(_ChainConnectionStatus.CONNECTED);
    }
  }, [chainInfoMap, chainStateMap, connectingChainStatus, show]);

  function checkChainConnected(chain: string) {
    connectingChain.current = chain;
    const chainState = chainStateMap[chain];

    if (!chainState) {
      // Couldn't get chain state
      return false;
    }

    return chainState.active;
  }

  function checkChainStatus(chain: string): _ChainConnectionStatus {
    connectingChain.current = chain;
    const chainState = chainStateMap[chain];

    if (!chainState) {
      // Couldn't get chain state
      return _ChainConnectionStatus.DISCONNECTED;
    }

    return chainState.connectionStatus;
  }

  function turnOnChain(chain: string) {
    enableChain(chain, false)
      .then(() => {
        setChainStatus(_ChainConnectionStatus.CONNECTING);
        connectingChain.current = chain;
        show(i18n.common.connecting, { type: 'warning' });
      })
      .catch(console.error);
  }

  function updateChain(navigation: NativeStackNavigationProp<RootStackParamList>) {
    navigation.navigate('NetworksSetting');
  }

  return { turnOnChain, checkChainConnected, checkChainStatus, connectingChainStatus, updateChain };
}
