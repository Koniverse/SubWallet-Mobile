import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountProxy, AccountProxyType, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { ALL_KEY } from 'constants/index';

const defaultAccountFilter = (poolType: YieldPoolType, poolChain?: string): ((account: AccountProxy) => boolean) => {
  return (account: AccountProxy) => {
    if (account.specialChain && poolChain !== account.specialChain) {
      return false;
    }

    if (isAccountAll(account.id)) {
      return false;
    }

    if (account.accountType === AccountProxyType.READ_ONLY) {
      return false;
    }

    return !(poolType === YieldPoolType.NOMINATION_POOL && account.accounts.some(ap => isEthereumAddress(ap.address)));
  };
};

export const accountFilterFunc = (
  chainInfoMap: Record<string, _ChainInfo>,
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountProxy) => boolean) => {
  return (account: AccountProxy) => {
    if (poolChain && poolChain !== ALL_KEY) {
      const chain = chainInfoMap[poolChain];
      const defaultFilter = defaultAccountFilter(poolType, poolChain);
      const isEvmChain = _isChainEvmCompatible(chain);

      return defaultFilter(account) && account.accounts.some(ap => isEvmChain === isEthereumAddress(ap.address));
    } else {
      return defaultAccountFilter(poolType)(account);
    }
  };
};
