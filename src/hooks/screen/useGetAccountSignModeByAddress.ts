// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { SIGN_MODE } from 'types/signer';
import { getAccountSignMode } from 'utils/account';
import { useMemo } from 'react';

const useGetAccountSignModeByAddress = (address?: string): SIGN_MODE => {
  const account = useGetAccountByAddress(address);

  return useMemo((): SIGN_MODE => {
    return getAccountSignMode(account);
  }, [account]);
};

export default useGetAccountSignModeByAddress;
