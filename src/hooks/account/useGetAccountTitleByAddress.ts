// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { useMemo } from 'react';
import i18n from 'utils/i18n/i18n';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountSignMode } from '@subwallet/extension-base/types';

const useGetAccountTitleByAddress = (address?: string): string => {
  const signMode = useGetAccountSignModeByAddress(address);
  const isEvm = useMemo(() => isEthereumAddress(address || ''), [address]);

  return useMemo((): string => {
    switch (signMode) {
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return i18n.common.ledgerAccount;
      case AccountSignMode.ALL_ACCOUNT:
        return i18n.common.allAccounts;
      case AccountSignMode.PASSWORD:
        return i18n.common.normalAccount;
      case AccountSignMode.QR:
        if (isEvm) {
          return 'EVM QR signer account';
        } else {
          return 'Substrate QR signer account';
        }
      case AccountSignMode.READ_ONLY:
        return i18n.common.watchOnlyAccount;
      case AccountSignMode.UNKNOWN:
      default:
        return i18n.common.unknownAccount;
    }
  }, [isEvm, signMode]);
};

export default useGetAccountTitleByAddress;
