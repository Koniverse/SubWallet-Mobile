// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { useMemo } from 'react';
import { AccountSignMode } from 'types/signer';
import i18n from 'utils/i18n/i18n';

const useGetAccountTitleByAddress = (address?: string): string => {
  const signMode = useGetAccountSignModeByAddress(address);

  return useMemo((): string => {
    switch (signMode) {
      case AccountSignMode.LEDGER:
        return i18n.common.ledgerAccount;
      case AccountSignMode.ALL_ACCOUNT:
        return i18n.common.allAccounts;
      case AccountSignMode.PASSWORD:
        return i18n.common.normalAccount;
      case AccountSignMode.QR:
        return i18n.common.qrSignerAccount;
      case AccountSignMode.READ_ONLY:
        return i18n.common.watchOnlyAccount;
      case AccountSignMode.UNKNOWN:
      default:
        return i18n.common.unknownAccount;
    }
  }, [signMode]);
};

export default useGetAccountTitleByAddress;
