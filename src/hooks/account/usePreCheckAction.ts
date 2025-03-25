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

//todo: i18n
//todo: solve error
const usePreCheckAction = (
  address?: string,
  blockAllAccount = true,
  message?: string,
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
      case AccountSignMode.READ_ONLY:
        return 'Watch-only account';
      case AccountSignMode.UNKNOWN:
      default:
        return 'Unknown account';
    }
  }, []);

  return useCallback(
    (onPress: VoidFunction, action: ExtrinsicType) => {
      return () => {
        if (!account) {
          hideAll();
          show('Account not exists');
        } else {
          const mode = getSignMode(account);
          let block = false;
          let accountTitle = getAccountTypeTitle(account);
          let defaultMessage = 'The account you are using is {{accountTitle}}, you cannot use this feature with it';
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
            defaultMessage = 'You are using a {{accountTitle}}. Staking is not supported with this account type';
          }

          if (mode === AccountSignMode.QR) {
            if (isEthereumAccount && !isDevMode) {
              accountTitle = 'EVM QR signer account';
              block = true;
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
            show((message || defaultMessage).replace('{{accountTitle}}', accountTitle), { type: 'normal' });
          }
        }
      };
    },
    [account, blockAllAccount, getAccountTypeTitle, hideAll, isDevMode, message, show],
  );
};

export default usePreCheckAction;
