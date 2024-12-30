import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountType } from 'types/ui-types';
import { RootState } from 'stores/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { isAccountAll } from 'utils/accountAll';
import { analysisAccounts } from 'hooks/screen/Home/Crypto/useGetChainSlugsByAccountType';
import { KeypairType } from '@polkadot/util-crypto/types';
import { AccountJson } from '@subwallet/extension-base/types';

function getChainsAccountType(
  accountType: AccountType,
  chainInfoMap: Record<string, _ChainInfo>,
  accountNetworks?: string[],
): string[] {
  const result: string[] = [];

  Object.keys(chainInfoMap).forEach(chain => {
    if (accountNetworks) {
      if (accountNetworks.includes(chain)) {
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

function getAccountType(type: KeypairType) {
  if (type === 'ethereum') {
    return 'ETHEREUM';
  } else if (['ed25519', 'sr25519', 'ecdsa'].includes(type)) {
    return 'SUBSTRATE';
  }

  return undefined;
}

export function useGetChainSlugs(): string[] {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);

  const accountType = useMemo(() => {
    const foundAccountType = currentAccount?.type ? getAccountType(currentAccount?.type) : undefined;

    if (foundAccountType) {
      return foundAccountType;
    }

    let _accountType: AccountType = 'ALL';

    if (currentAccount?.address) {
      if (isAccountAll(currentAccount.address)) {
        const [isContainOnlySubstrate, isContainOnlyEthereum] = analysisAccounts(accounts);

        if (isContainOnlyEthereum) {
          _accountType = 'ETHEREUM';
        } else if (isContainOnlySubstrate) {
          _accountType = 'SUBSTRATE';
        }
      } else if (isEthereumAddress(currentAccount?.address)) {
        _accountType = 'ETHEREUM';
      } else {
        _accountType = 'SUBSTRATE';
      }
    }

    return _accountType;
  }, [accounts, currentAccount?.address, currentAccount?.type]);

  const accountNetwork = useMemo(() => {
    const account: AccountJson | null = currentAccount;

    if (account?.isHardware) {
      const isEthereum = isEthereumAddress(account.address || '');

      if (isEthereum) {
        return undefined;
      } else {
        const availableGen: string[] = account.availableGenesisHashes || [];

        return availableGen.map(gen => findNetworkJsonByGenesisHash(chainInfoMap, gen)?.slug || '');
      }
    } else {
      return undefined;
    }
  }, [chainInfoMap, currentAccount]);

  return useMemo<string[]>(() => {
    return getChainsAccountType(accountType, chainInfoMap, accountNetwork);
  }, [accountType, chainInfoMap, accountNetwork]);
}
