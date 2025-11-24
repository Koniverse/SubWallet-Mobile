// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import useCoreCreateGetChainSlugsByAccountProxy from 'hooks/chain/useCoreCreateGetChainSlugsByAccountProxy';

const useGetChainSlugsByCurrentAccountProxy = (): string[] => {
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const getChainSlugsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();

  return useMemo(() => {
    if (!currentAccountProxy) {
      return [];
    }

    return getChainSlugsByAccountProxy(currentAccountProxy);
  }, [currentAccountProxy, getChainSlugsByAccountProxy]);
};

export default useGetChainSlugsByCurrentAccountProxy;
