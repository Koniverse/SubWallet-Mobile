// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { isSameAddress, reformatAddress } from '@subwallet/extension-base/utils';
import { getSignableAccountInfos } from 'messaging/transaction/multisig';
import { getSubstrateProxyAccountGroup } from 'messaging/transaction/substrateProxy';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  GetWrappedTransactionSignersHookType,
  ResolveWrappedTransactionSigners,
  WrappedTransactionSigner,
} from 'types/wrappedTransaction';
import { findAccountByAddress } from 'utils/account/account';

/**
 * Hook that resolves all valid **signers** for a **wrapped transaction**.
 *
 * A wrapped transaction is a transaction whose original sender cannot sign the
 * extrinsic directly and must be wrapped by another mechanism:
 *
 * - **Substrate proxy** — a proxy account signs the extrinsic, while the execution
 *   origin remains the proxied account.
 * - **Multisig** — a signatory account signs on behalf of a multisig account
 *   (approval, reject and execution).
 *
 * The returned accounts represent the **actual extrinsic signers**, not the original
 * sender.
 *
 * Only Substrate accounts are supported. Not used for liquid staking or swap.
 */
export function useGetWrappedTransactionSigners(): GetWrappedTransactionSignersHookType {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  /**
   * Resolve Substrate proxy accounts that are allowed to sign the wrapped transaction.
   */
  const getWrappedSubstrateProxySigners = useCallback<ResolveWrappedTransactionSigners>(
    async ({ chainSlug, excludedSubstrateProxyAccounts, extrinsicType, targetAddress }) => {
      try {
        const chainInfo = chainInfoMap[chainSlug];

        if (!targetAddress || !chainInfo?.substrateInfo?.supportProxy) {
          return [];
        }

        const request: RequestGetSubstrateProxyAccountGroup = {
          chain: chainSlug,
          address: targetAddress,
          type: extrinsicType,
          excludedSubstrateProxyAccounts,
        };

        const proxyGroup = await getSubstrateProxyAccountGroup(request);

        if (!proxyGroup?.substrateProxyAccounts?.length) {
          return [];
        }

        const validAccounts = allAccounts.filter(
          acc => acc.chainType === AccountChainType.SUBSTRATE && acc.signMode !== AccountSignMode.READ_ONLY,
        );

        return proxyGroup.substrateProxyAccounts
          .filter(proxy => validAccounts.some(acc => isSameAddress(acc.address, proxy.substrateProxyAddress)))
          .map<WrappedTransactionSigner>(proxy => ({
            ...proxy,
            kind: 'substrate_proxy',
            address: reformatAddress(proxy.substrateProxyAddress, chainInfo.substrateInfo?.addressPrefix),
          }));
      } catch (e) {
        console.error('Error fetching wrapped substrate proxy signers:', e);

        return [];
      }
    },
    [allAccounts, chainInfoMap],
  );

  /**
   * Resolve multisig signatory accounts that can sign the wrapped multisig transaction.
   */
  const getWrappedMultisigSigners = useCallback<ResolveWrappedTransactionSigners>(
    async ({ chainSlug, extrinsicType, targetAddress }) => {
      try {
        const chainInfo = chainInfoMap[chainSlug];

        if (!targetAddress || !chainInfo?.substrateInfo?.supportMultisig || !extrinsicType) {
          return [];
        }

        const account = findAccountByAddress(allAccounts, targetAddress);

        if (!account?.proxyId || !account.isMultisig) {
          return [];
        }

        const { signableProxies } = await getSignableAccountInfos({
          extrinsicType,
          chain: chainSlug,
          multisigProxyId: account.proxyId,
        });

        return signableProxies.map<WrappedTransactionSigner>(signer => ({
          ...signer,
          kind: 'signatory',
          address: reformatAddress(signer.address, chainInfo.substrateInfo?.addressPrefix),
        }));
      } catch (e) {
        console.error('Error fetching wrapped multisig signers:', e);

        return [];
      }
    },
    [allAccounts, chainInfoMap],
  );

  /**
   * Public resolver that merges all possible wrapped transaction signers.
   */
  return useCallback<GetWrappedTransactionSignersHookType>(
    async params => {
      const [multisigSigners, substrateProxySigners] = await Promise.all([
        getWrappedMultisigSigners(params),
        getWrappedSubstrateProxySigners(params),
      ]);

      return [...multisigSigners, ...substrateProxySigners];
    },
    [getWrappedMultisigSigners, getWrappedSubstrateProxySigners],
  );
}

export default useGetWrappedTransactionSigners;
