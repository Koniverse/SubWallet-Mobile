// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { useMemo } from 'react';
import { AccountSignMode } from 'types/signer';

const useGetAccountTitleByAddress = (address?: string): string => {
  const signMode = useGetAccountSignModeByAddress(address);

  return useMemo((): string => {
    switch (signMode) {
      case AccountSignMode.LEDGER:
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
  }, [signMode]);
};

export default useGetAccountTitleByAddress;
