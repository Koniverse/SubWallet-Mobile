import { AccountJson } from '@subwallet/extension-base/background/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { RootState } from 'stores/index';

function getSelectedAddress(accounts: AccountJson[], currentAddress: string | undefined): string {
  if (!currentAddress || !accounts.length) {
    return '';
  }

  if (!isAccountAll(currentAddress)) {
    return currentAddress;
  }

  return accounts.find(a => !isAccountAll(a.address))?.address || '';
}

export default function useHistorySelection(initialChain?: string, initialAddress?: string) {
  const { accounts, currentAccount } = useSelector((root: RootState) => root.accountState);
  const preservedCurrentAddress = useRef<string>(currentAccount ? currentAccount.address : '');
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialAddress || getSelectedAddress(accounts, currentAccount?.address),
  );
  const [selectedChain, setSelectedChain] = useState<string>(initialChain || 'polkadot');

  useEffect(() => {
    if (currentAccount?.address) {
      if (preservedCurrentAddress.current !== currentAccount.address) {
        preservedCurrentAddress.current = currentAccount.address;
        setSelectedAddress(getSelectedAddress(accounts, currentAccount.address));
      }
    } else {
      preservedCurrentAddress.current = '';
      setSelectedAddress('');
    }
  }, [accounts, currentAccount?.address]);

  return {
    selectedAddress,
    setSelectedAddress,
    selectedChain,
    setSelectedChain,
  };
}
