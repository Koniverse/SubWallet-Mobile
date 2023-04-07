import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import React from 'react';
import { TransactionContextProps } from 'types/transaction';

export const TransactionContext = React.createContext<TransactionContextProps>({
  transactionType: ExtrinsicType.TRANSFER_BALANCE,
  from: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFrom: value => {},
  chain: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setChain: value => {},
  asset: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAsset: value => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDone: extrinsicHash => {},
  onClickRightBtn: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setShowRightBtn: value => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledRightBtn: value => {},
});
