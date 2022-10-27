// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountSignType } from 'types/account';
import { getAccountSignType } from 'utils/account';
import { useMemo } from 'react';

const useGetAccountSignTypeByAddress = (address: string): AccountSignType => {
  const account = useGetAccountByAddress(address);

  return useMemo((): AccountSignType => {
    return getAccountSignType(account);
  }, [account]);
};

export default useGetAccountSignTypeByAddress;
