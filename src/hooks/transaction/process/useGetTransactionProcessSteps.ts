import { ProcessStep, StepStatus } from '@subwallet/extension-base/types';
import { useCallback } from 'react';
import { useGetTransactionProcessStepText } from 'hooks/transaction/process/index';
import { TransactionProcessStepItemType } from 'types/component';

const useGetTransactionProcessSteps = () => {
  const getStepText = useGetTransactionProcessStepText();

  return useCallback(
    (processStep: ProcessStep[], combineInfo: unknown, fillStepStatus = true): TransactionProcessStepItemType[] => {
      return processStep.map((ps, index) => ({
        status: fillStepStatus ? ps.status : StepStatus.QUEUED,
        content: getStepText(ps, combineInfo),
        index,
        isLastItem: index === processStep.length - 1,
      }));
    },
    [getStepText],
  );
};

export default useGetTransactionProcessSteps;
