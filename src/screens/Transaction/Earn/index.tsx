import React from 'react';
import { EarningProps } from 'routes/transaction/transactionAction';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';

const EarnTransaction: React.FC<EarningProps> = (props: EarningProps) => {
  const {
    route: {
      params: { slug },
    },
  } = props;

  return <TransactionLayout title={slug}>{/* Empty */}</TransactionLayout>;
};

export default EarnTransaction;
