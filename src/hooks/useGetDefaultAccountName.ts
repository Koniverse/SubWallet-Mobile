// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';

const useGetDefaultAccountName = () => {
  const { accounts } = useSelector((state: RootState) => state.accounts);

  return useMemo(() => {
    const filtered = accounts.filter(account => !isAccountAll(account.address));

    return `Account ${filtered.length + 1}`;
  }, [accounts]);
};

export default useGetDefaultAccountName;
