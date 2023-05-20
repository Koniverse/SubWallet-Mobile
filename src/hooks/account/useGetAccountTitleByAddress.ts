// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { useMemo } from 'react';
import { SIGN_MODE } from 'types/signer';

const useGetAccountTitleByAddress = (address?: string): string => {
  const signMode = useGetAccountSignModeByAddress(address);

  return useMemo((): string => {
    switch (signMode) {
      case SIGN_MODE.LEDGER:
        return 'Ledger account';
      case SIGN_MODE.ALL_ACCOUNT:
        return 'All account';
      case SIGN_MODE.PASSWORD:
        return 'Normal account';
      case SIGN_MODE.QR:
        return 'QR signer account';
      case SIGN_MODE.READ_ONLY:
        return 'Watch-only account';
      case SIGN_MODE.UNKNOWN:
      default:
        return 'Unknown account';
    }
  }, [signMode]);
};

export default useGetAccountTitleByAddress;
