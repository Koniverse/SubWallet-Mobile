import React from 'react';
import { ApprovePendingTxRequest } from '@subwallet/extension-base/types/multisig';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MultisigInfoArea from 'screens/Confirmations/parts/Area/MultisigInfoArea';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

/** Confirmation shown when approving, executing or cancelling a pending multisig tx. */
const PendingMultisigConfirmation: React.FC<Props> = ({ transaction }: Props) => {
  const transactionData = transaction.data as ApprovePendingTxRequest;

  return (
    <ConfirmationContent isTransaction transaction={transaction}>
      <CommonTransactionInfo
        address={transactionData.multisigMetadata.multisigAddress}
        network={transaction.chain}
      />
      <MultisigInfoArea transaction={transaction} />
    </ConfirmationContent>
  );
};

export default PendingMultisigConfirmation;
