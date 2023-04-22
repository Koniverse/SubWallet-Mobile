// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findChainInfoByChainId } from 'utils/chain';

const useGetChainInfoByChainId = (chainId?: number) => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  return useMemo(() => findChainInfoByChainId(chainInfoMap, chainId), [chainInfoMap, chainId]);
};

export default useGetChainInfoByChainId;
