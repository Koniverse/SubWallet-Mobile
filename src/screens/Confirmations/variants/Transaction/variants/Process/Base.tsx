import { VoidFunction } from 'types/index';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import React, { useMemo } from 'react';
import { ConfirmModalInfo } from 'providers/AppModalContext';
import { ProcessTransactionData } from '@subwallet/extension-base/types';

export interface BaseProcessConfirmationProps {
  process: ProcessTransactionData;
  openAlert: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  closeAlert: VoidFunction;
}

const BaseProcessConfirmation = ({ process }: BaseProcessConfirmationProps) => {
  const chain = useMemo(() => {
    const step = process.steps.find(_step => _step.id === process.currentStepId);

    return step?.chain || '';
  }, [process.currentStepId, process.steps]);

  return (
    <ConfirmationContent>
      <CommonTransactionInfo address={process.address} network={chain} />
    </ConfirmationContent>
  );
};

export default BaseProcessConfirmation;
