import React from 'react';
import { TransactionInfoBlockProps } from './types';
import { ProcessType } from '@subwallet/extension-base/types';
import Swap from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/Swap';
import { Earn } from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/Earn';

type Props = TransactionInfoBlockProps;

const TransactionInfoBlock: React.FC<Props> = (props: Props) => {
  const { processData } = props;

  if (processData.type === ProcessType.SWAP) {
    return <Swap {...props} />;
  }

  if (processData.type === ProcessType.EARNING) {
    return <Earn {...props} />;
  }

  return <></>;
};

export default TransactionInfoBlock;
