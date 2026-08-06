// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ExcludedSubstrateProxyAccounts, SubstrateProxyType } from '@subwallet/extension-base/types';

/**
 * A **wrapped transaction** is a transaction whose original sender cannot sign the
 * extrinsic directly and must be wrapped by another mechanism:
 *
 * - **Substrate proxy**: a delegate account signs while the execution origin stays
 *   the proxied account.
 * - **Multisig**: a signatory signs on behalf of the multisig account (approve,
 *   execute or cancel).
 *
 * `WrappedTransactionSigner` describes an account that is allowed to be the *actual*
 * extrinsic signer — not the original sender.
 */
export interface WrappedTransactionSigner {
  kind: 'substrate_proxy' | 'signatory';
  address: string;
  proxyId?: string;
  /** True when the entry is the proxied account itself (it can also sign directly). */
  isProxiedAccount?: boolean;
  substrateProxyType?: SubstrateProxyType;
  delay?: number;
  substrateProxyAddress?: string;
}

export type ResolveWrappedTransactionSignersHookParams = {
  chainSlug: string;
  targetAddress: string;
  extrinsicType?: ExtrinsicType;
  excludedSubstrateProxyAccounts?: ExcludedSubstrateProxyAccounts[];
};

export type ResolveWrappedTransactionSigners = (
  params: ResolveWrappedTransactionSignersHookParams,
) => Promise<WrappedTransactionSigner[]>;

export type GetWrappedTransactionSignersHookType = (
  params: ResolveWrappedTransactionSignersHookParams,
) => Promise<WrappedTransactionSigner[]>;
