import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { RootState } from 'stores/index';
import { AccountProxy } from '@subwallet/extension-base/types';
import useChainInfoWithState from 'hooks/chain/useChainInfoWithState';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import { ChainItemType } from 'types/index';
import { AccountAddressItemType } from 'types/account';
import { getReformatedAddressRelatedToChain } from 'utils/account';

export default function useHistorySelection(initialChain?: string, initialAddress?: string) {
  const { accountProxies, currentAccountProxy } = useSelector((root: RootState) => root.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const chainInfoList = useChainInfoWithState();
  const allowedChains = useGetChainSlugsByAccount();
  const [selectedAddress, setSelectedAddress] = useState<string>(initialAddress || '');
  const [selectedChain, setSelectedChain] = useState<string>(initialChain || '');

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    chainInfoList.forEach(c => {
      if (allowedChains.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug,
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoList]);

  const accountAddressItems = useMemo(() => {
    if (!currentAccountProxy) {
      return [];
    }

    const chainInfo = selectedChain ? chainInfoMap[selectedChain] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach(a => {
        // TODO: This is a temporary validation method.
        //  Find a more efficient way to get isValid.
        const isValid = getReformatedAddressRelatedToChain(a, chainInfo);

        if (isValid) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address: a.address,
          });
        }
      });
    };

    if (isAccountAll(currentAccountProxy.id)) {
      accountProxies.forEach(ap => {
        if (isAccountAll(ap.id)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      updateResult(currentAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, currentAccountProxy, selectedChain]);

  useEffect(() => {
    if (chainItems.length) {
      setSelectedChain(prevChain => {
        if (!prevChain) {
          return chainItems[0].slug;
        }

        if (!chainItems.some(c => c.slug === prevChain)) {
          return chainItems[0].slug;
        }

        return prevChain;
      });
    } else {
      setSelectedChain('');
    }
  }, [chainInfoMap, chainItems]);

  useEffect(() => {
    setSelectedAddress(prevResult => {
      if (accountAddressItems.length) {
        if (!prevResult) {
          return accountAddressItems[0].address;
        }

        if (!accountAddressItems.some(a => a.address === prevResult)) {
          return accountAddressItems[0].address;
        }
      }

      return prevResult;
    });
  }, [accountAddressItems, initialAddress]);

  return {
    chainItems,
    accountAddressItems,
    selectedAddress,
    setSelectedAddress,
    selectedChain,
    setSelectedChain,
  };
}
