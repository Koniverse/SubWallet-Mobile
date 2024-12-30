import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountProxy, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { ALL_KEY } from 'constants/index';
import { AccountChainType } from '@subwallet/extension-base/types/account/info/keyring';
import { AccountProxyType } from '@subwallet/extension-base/types/account/info/proxy';

const defaultAccountFilter = (poolType: YieldPoolType, poolChain?: string): ((account: AccountProxy) => boolean) => {
  return (account: AccountProxy) => {
    if (account.specialChain && poolChain !== account.specialChain) {
      return false;
    }

    if (isAccountAll(account.id)) {
      return false;
    }

    return !(
      poolType === YieldPoolType.NOMINATION_POOL &&
      account.accountType === AccountProxyType.SOLO &&
      account.chainTypes.includes(AccountChainType.ETHEREUM)
    );
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
