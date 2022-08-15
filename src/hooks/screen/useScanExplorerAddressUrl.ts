// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getScanExplorerAddressInfoUrl } from 'utils/index';

export default function useScanExplorerAddressUrl(networkKey: string, hash: string) {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const blockExplorer = networkMap[networkKey]?.blockExplorer;

  if (blockExplorer) {
    return `${blockExplorer}/account/${hash}`;
  } else {
    return getScanExplorerAddressInfoUrl(networkKey, hash);
  }
}
