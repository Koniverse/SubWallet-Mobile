import { useMemo } from 'react';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';

export const useCheckShowAddressFormatInfoBox = (transaction?: SWTransactionResult) => {
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

  return useMemo(() => {
    if (!transaction) {
      return false;
    }

    if (transaction.extrinsicType === ExtrinsicType.SWAP) {
      return false;
    }

    const targetChain = transaction.chain;

    return checkIsPolkadotUnifiedChain(targetChain);
  }, [checkIsPolkadotUnifiedChain, transaction]);
};
