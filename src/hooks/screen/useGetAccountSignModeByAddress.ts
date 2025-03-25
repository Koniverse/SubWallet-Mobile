// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { getSignMode } from 'utils/account';
import { useMemo } from 'react';
import { AccountSignMode } from '@subwallet/extension-base/types';

const useGetAccountSignModeByAddress = (address?: string): AccountSignMode => {
  const account = useGetAccountByAddress(address);

  return useMemo((): AccountSignMode => {
    return getSignMode(account);
  }, [account]);
};

export default useGetAccountSignModeByAddress;
