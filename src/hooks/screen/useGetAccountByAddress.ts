// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { findAccountByAddress } from 'utils/account';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useGetAccountByAddress = (address?: string): AccountJson | null => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  return useMemo((): AccountJson | null => {
    return findAccountByAddress(accounts, address);
  }, [accounts, address]);
};

export default useGetAccountByAddress;
