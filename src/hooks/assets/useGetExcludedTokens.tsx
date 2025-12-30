// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
// import { isAccountAll } from '@subwallet/extension-base/utils';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

// This hook retrieves a list of excluded tokens based on the provided chain list and account proxy.
// For Substrate ECDSA Ledger accounts, excluded tokens are those that are non-native and backed by smart contracts (e.g., ERC-20).
const useGetExcludedTokens = () => {
  // const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  // const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  // const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  return useCallback(
    (chainList: string[], accountProxy?: AccountProxy): string[] => {
      const targetAccountProxy = accountProxy || currentAccountProxy;

      if (!targetAccountProxy) {
        return [];
      }

      // if (isAccountAll(targetAccountProxy.id)) {
      //   const { hasOnlyLedgerEvm, hasOnlyLedgerSubstrateEcdsa } =
      //     checkIfAllAccountsAreSpecificLedgerTypes(accountProxies);
      //
      //   if (hasOnlyLedgerSubstrateEcdsa) {
      //     return getExcludedTokensForSubstrateEcdsa(chainAssetList, chainList, chainInfoMap);
      //   }
      //
      //   if (hasOnlyLedgerEvm) {
      //     return getExcludedTokensForLedgerEvm(chainAssetList, chainList, chainInfoMap);
      //   }
      // } else {
      //   const signMode = getSignModeByAccountProxy(targetAccountProxy);
      //
      //   if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
      //     return getExcludedTokensForSubstrateEcdsa(chainAssetList, chainList, chainInfoMap);
      //   }
      //
      //   if (signMode === AccountSignMode.GENERIC_LEDGER) {
      //     if (targetAccountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
      //       return getExcludedTokensForLedgerEvm(chainAssetList, chainList, chainInfoMap);
      //     }
      //   }
      // }

      return [];
    },
    [currentAccountProxy],
  );
};

export default useGetExcludedTokens;
