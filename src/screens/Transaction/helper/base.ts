import { _ChainInfo } from '@subwallet/chain-list/types';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ALL_KEY } from 'constants/index';
import {
  _getSubstrateGenesisHash,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';

const defaultAccountFilter = (stakingType: StakingType, chain?: _ChainInfo): ((account: AccountJson) => boolean) => {
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

    return !(stakingType === StakingType.POOLED && isEthereumAddress(account.address));
  };
};

export const accountFilterFunc = (
  chainInfoMap: Record<string, _ChainInfo>,
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson) => {
    if (stakingChain && stakingChain !== ALL_KEY) {
      const chain = chainInfoMap[stakingChain];
      const defaultFilter = defaultAccountFilter(stakingType, chain);
      const isEvmChain = _isChainEvmCompatible(chain);

      return defaultFilter(account) && isEvmChain === isEthereumAddress(account.address);
    } else {
      return defaultAccountFilter(stakingType)(account);
    }
  };
};
