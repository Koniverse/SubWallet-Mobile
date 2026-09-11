// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { useCallback } from 'react';

import { VoidFunction } from 'types/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { getSignMode } from 'utils/account';
import { ALL_STAKING_ACTIONS } from 'constants/transaction';
import { useToast } from 'react-native-toast-notifications';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { getDevMode } from 'utils/storage';
import { AccountJson, AccountSignMode } from '@subwallet/extension-base/types';
import { getSignableAccountInfos } from 'messaging/transaction/multisig';
import i18n from 'utils/i18n/i18n';

//todo: i18n
//todo: solve error
const usePreCheckAction = (
  address?: string,
  blockAllAccount = true,
  message?: string,
  chain?: string,
  // Severity for a blocked action; the extension's `type` option. Overrides of
  // `messageOverride` stay danger regardless.
  type?: 'normal' | 'danger' | 'warning',
): ((onPress: VoidFunction, action: ExtrinsicType) => VoidFunction) => {
  const { show, hideAll } = useToast();

  const account = useGetAccountByAddress(address);
  const isDevMode = getDevMode();
  const getAccountTypeTitle = useCallback((_account: AccountJson): string => {
    const signMode = getSignMode(_account);

    switch (signMode) {
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return 'Ledger account';
      case AccountSignMode.ALL_ACCOUNT:
        return 'All account';
      case AccountSignMode.PASSWORD:
        return 'Normal account';
      case AccountSignMode.QR:
        return 'QR signer account';
      case AccountSignMode.MULTISIG:
        return i18n.multisig.multisigAccount;
      case AccountSignMode.READ_ONLY:
        return 'Watch-only account';
      case AccountSignMode.UNKNOWN:
      default:
        return 'Unknown account';
    }
  }, []);

  return useCallback(
    (onPress: VoidFunction, action: ExtrinsicType) => {
      return async () => {
        if (!account) {
          hideAll();
          // Same 1.5s the extension gives this short notice.
          show('Account not exists', { duration: 1500 });
        } else {
          const mode = getSignMode(account);
          let block = false;
          let accountTitle = getAccountTypeTitle(account);
          let defaultMessage = 'The account you are using is {{accountTitle}}, you cannot use this feature with it';
          let messageOverride: string | undefined;
          const isEthereumAccount = isEthereumAddress(account.address);

          switch (mode) {
            case AccountSignMode.READ_ONLY:
            case AccountSignMode.UNKNOWN:
            case AccountSignMode.GENERIC_LEDGER: // TODO: change later
            case AccountSignMode.LEGACY_LEDGER: // TODO: change later
              block = true;
              break;
            case AccountSignMode.ALL_ACCOUNT:
              if (blockAllAccount) {
                block = true;
              }

              break;
          }

          if (ALL_STAKING_ACTIONS.includes(action)) {
            defaultMessage = 'You are using a {{accountTitle}}. Earning is not supported with this account type';
          }

          if (mode === AccountSignMode.QR) {
            if (isEthereumAccount && !isDevMode) {
              accountTitle = 'EVM QR signer account';
              block = true;
            }
          }

          // A multisig account can only act when at least one of its signatories is
          // available in this wallet and allowed to sign this extrinsic type.
          if (account.isMultisig && chain) {
            try {
              const { signableProxies } = await getSignableAccountInfos({
                multisigProxyId: account.address,
                extrinsicType: action,
                chain,
              });

              if (!signableProxies.length) {
                block = true;
                messageOverride = i18n.multisig.noMultisigSignatories;
              }
            } catch (e) {
              console.error(e);
            }
          }

          // The extension funnels every unsupported action through this one check
          // (hooks/account/usePreCheckAction.ts:89): an account may only run an extrinsic
          // type its sign mode can actually sign. For a multisig account this is what
          // blocks swap, cross-chain transfer, claim bridge and liquid staking, while
          // leaving same-chain transfer, staking, governance, proxy and NFT send alone.
          // Kept additive: mobile's own switch above still over-blocks Ledger on purpose.
          if (!account.transactionActions.includes(action)) {
            block = true;

            // ALL_ACCOUNT carries no transaction actions of its own, so screens that opt
            // out of blocking it must keep working - same escape as the extension.
            if (mode === AccountSignMode.ALL_ACCOUNT && !blockAllAccount) {
              block = false;
            }
          }

          // if (mode === AccountSignMode.LEDGER) {
          //   const networkBlock: string[] = BLOCK_ACTION_LEDGER_NETWORKS[action] || [];
          //   const isEthereumAccount = isEthereumAddress(account.address);
          //
          //   if (networkBlock.includes('*')) {
          //     // Block all network
          //     block = true;
          //   } else if (networkBlock.includes('evm') && isEthereumAccount) {
          //     // Block evm network
          //     accountTitle = 'Ledger - EVM account';
          //     block = true;
          //   } else if (networkBlock.includes('substrate') && !isEthereumAccount) {
          //     // Block evm network
          //     accountTitle = 'Ledger - Substrate account';
          //     block = true;
          //   } else {
          //     const ledgerNetwork = PredefinedLedgerNetwork.find(
          //       network => network.genesisHash === account.originGenesisHash,
          //     );
          //     const networkName = ledgerNetwork?.accountName || 'Unknown';
          //     const slug = ledgerNetwork?.slug || '';
          //
          //     if (networkBlock.includes(slug)) {
          //       hideAll();
          //       show(`Ledger does not support this action with ${networkName}`, { type: 'normal' });
          //
          //       return;
          //     }
          //   }
          // }

          // TODO: Enable later

          if (!block) {
            onPress();
          } else {
            hideAll();
            show((messageOverride || message || defaultMessage).replace('{{accountTitle}}', accountTitle), {
              type: messageOverride ? 'danger' : type || 'normal',
              // The extension keeps a blocked-action notice up for 8s; the provider default
              // (4s) is too short to read a two-line explanation.
              duration: 8000,
            });
          }
        }
      };
    },
    [account, blockAllAccount, chain, getAccountTypeTitle, hideAll, isDevMode, message, show, type],
  );
};

export default usePreCheckAction;
