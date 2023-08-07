// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AbstractAddressJson } from '@subwallet/extension-base/background/types';
import { useCallback } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import reformatAddress from 'utils/index';

const useFormatAddress = (addressPrefix?: number) => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  return useCallback(
    (item: AbstractAddressJson): string => {
      let addPrefix = 42;

      if (addressPrefix !== undefined) {
        addPrefix = addressPrefix;
      }

      if (item.originGenesisHash) {
        const network = findNetworkJsonByGenesisHash(chainInfoMap, item.originGenesisHash);

        if (network) {
          addPrefix = network.substrateInfo?.addressPrefix ?? addPrefix;
        }
      }

      return reformatAddress(item.address, addPrefix);
    },
    [addressPrefix, chainInfoMap],
  );
};

export default useFormatAddress;
