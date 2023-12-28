import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import {
  _getSubstrateGenesisHash,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { ALL_KEY } from 'constants/index';

const defaultAccountFilter = (poolType: YieldPoolType, chain?: _ChainInfo): ((account: AccountJson) => boolean) => {
  return (account: AccountJson) => {
    if (account.originGenesisHash && chain && _getSubstrateGenesisHash(chain) !== account.originGenesisHash) {
      return false;
    }

    if (isAccountAll(account.address)) {
      return false;
    }

    if (account.isReadOnly) {
      return false;
    }

    return !(poolType === YieldPoolType.NOMINATION_POOL && isEthereumAddress(account.address));
  };
};

export const accountFilterFunc = (
  chainInfoMap: Record<string, _ChainInfo>,
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson) => {
    if (poolChain && poolChain !== ALL_KEY) {
      const chain = chainInfoMap[poolChain];
      const defaultFilter = defaultAccountFilter(poolType, chain);
      const isEvmChain = _isChainEvmCompatible(chain);

      return defaultFilter(account) && isEvmChain === isEthereumAddress(account.address);
    } else {
      return defaultAccountFilter(poolType)(account);
    }
  };
};
