import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountType } from 'types/ui-types';
import { RootState } from 'stores/index';
import { findAccountByAddress } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { isAccountAll } from 'utils/accountAll';

function getChainsAccountType(
  accountType: AccountType,
  chainInfoMap: Record<string, _ChainInfo>,
  accountNetwork?: string,
): string[] {
  const result: string[] = [];

  Object.keys(chainInfoMap).forEach(chain => {
    if (accountNetwork) {
      if (chain === accountNetwork) {
        result.push(chain);
      }
    } else {
      const isChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[chain]);

      if (isChainEvmCompatible) {
        if (accountType === 'ALL' || accountType === 'ETHEREUM') {
          result.push(chain);
        }
      } else {
        if (accountType === 'ALL' || accountType === 'SUBSTRATE') {
          result.push(chain);
        }
      }
    }
  });

  return result;
}

export function useGetChainSlugs(address?: string): string[] {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);

  const accountType = useMemo(() => {
    let _accountType: AccountType = 'ALL';

    if (address) {
      if (isAccountAll(address)) {
        return 'ALL';
      }

      if (isEthereumAddress(address)) {
        _accountType = 'ETHEREUM';
      } else {
        _accountType = 'SUBSTRATE';
      }
    } else {
      if (currentAccount?.type === 'ethereum') {
        _accountType = 'ETHEREUM';
      } else if (currentAccount?.type === 'sr25519') {
        _accountType = 'SUBSTRATE';
      }
    }

    return _accountType;
  }, [address, currentAccount?.type]);

  const accountNetwork = useMemo(() => {
    let account: AccountJson | null = currentAccount;

    if (address) {
      account = findAccountByAddress(accounts, address);
    }

    const originGenesisHash = account?.originGenesisHash;

    if (originGenesisHash) {
      return findNetworkJsonByGenesisHash(chainInfoMap, originGenesisHash)?.slug;
    } else {
      return undefined;
    }
  }, [accounts, address, chainInfoMap, currentAccount]);

  return useMemo<string[]>(() => {
    return getChainsAccountType(accountType, chainInfoMap, accountNetwork);
  }, [accountType, chainInfoMap, accountNetwork]);
}
