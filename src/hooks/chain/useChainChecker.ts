// Copyright 2019-2023 Koniverse/SubWallet-mobile authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef } from 'react';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { enableChain } from 'messaging/index';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

export default function useChainChecker(isShowToast = true) {
  const { chainInfoMap, chainStateMap, chainStatusMap } = useSelector((root: RootState) => root.chainStore);
  const connectingChain = useRef<string | null>(null);
  const { show, hideAll } = useToast();

  useEffect(() => {
    if (
      connectingChain.current &&
      chainStatusMap[connectingChain.current]?.connectionStatus === _ChainConnectionStatus.CONNECTED
    ) {
      const chainName = chainInfoMap[connectingChain.current].name;
      if (isShowToast) {
        hideAll();
        show(i18n.formatString(i18n.common.chainConnected, chainName) as string, { type: 'success' });
      }
      connectingChain.current = null;
    }
  }, [chainInfoMap, chainStateMap, chainStatusMap, hideAll, isShowToast, show]);

  const checkChainConnected = useCallback(
    (chain: string) => {
      const chainState = chainStateMap[chain];

      if (!chainState) {
        // Couldn't get chain state
        return false;
      }

      return chainState.active;
    },
    [chainStateMap],
  );

  const turnOnChain = useCallback(
    (chain: string) => {
      connectingChain.current = chain;
      enableChain(chain, false)
        .then(() => {
          isShowToast && show(i18n.common.connecting, { type: 'warning' });
        })
        .catch(console.error);
    },
    [isShowToast, show],
  );
  return { turnOnChain, checkChainConnected };
}
