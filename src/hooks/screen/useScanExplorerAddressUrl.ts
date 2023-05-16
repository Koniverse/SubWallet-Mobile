// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getScanExplorerAddressInfoUrl } from 'utils/index';

export default function useScanExplorerAddressUrl(networkKey: string, hash: string) {
  const chainMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainInfo = chainMap[networkKey];

  const blockExplorer = chainInfo?.substrateInfo?.blockExplorer || chainInfo?.evmInfo?.blockExplorer;

  if (blockExplorer) {
    return `${blockExplorer}/account/${hash}`;
  } else {
    return getScanExplorerAddressInfoUrl(networkKey, hash);
  }
}
