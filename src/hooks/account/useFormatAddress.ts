// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { AbstractAddressJson } from '@subwallet/extension-base/types';
import { reformatAddress } from 'utils/account/account';

const useFormatAddress = (addressPrefix?: number) => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  return useCallback(
    (item: AbstractAddressJson): string => {
      let addPrefix = 42;

      if (addressPrefix !== undefined) {
        addPrefix = addressPrefix;
      }

      if ('genesisHash' in item) {
        const genesisHash = item.genesisHash as string;
        const network = findNetworkJsonByGenesisHash(chainInfoMap, genesisHash);

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
