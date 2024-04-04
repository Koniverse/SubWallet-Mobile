import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ExtrinsicTypeMobile } from 'types/transaction';

export const detectTransactionPersistKey = (type?: ExtrinsicTypeMobile): string => {
  switch (type) {
    case ExtrinsicType.JOIN_YIELD_POOL:
      return 'earn-storage';
    default:
      return '';
  }
};
