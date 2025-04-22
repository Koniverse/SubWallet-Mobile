import { useCallback } from 'react';
import { AccountJson } from '@subwallet/extension-base/types';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { getReformatedAddressRelatedToChain } from 'utils/account';

const useReformatAddress = () => {
  return useCallback((accountJson: AccountJson, chainInfo: _ChainInfo): string | undefined => {
    return getReformatedAddressRelatedToChain(accountJson, chainInfo);
  }, []);
};

export default useReformatAddress;
