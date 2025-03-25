import { ProcessStep, StepStatus } from '@subwallet/extension-base/types';
import { useCallback } from 'react';
import { ProcessStepItemType } from 'components/ProcessStepItem';
import { useGetTransactionProcessStepText } from 'hooks/transaction/process/index';

const useGetTransactionProcessSteps = () => {
  const getStepText = useGetTransactionProcessStepText();

  return useCallback(
    (processStep: ProcessStep[], combineInfo: unknown, fillStepStatus = true): ProcessStepItemType[] => {
      return processStep.map((ps, index) => ({
        status: fillStepStatus ? ps.status : StepStatus.QUEUED,
        text: getStepText(ps, combineInfo),
        index,
        isLastItem: index === processStep.length - 1,
        isFirstItem: index === 0,
      }));
    },
    [getStepText],
  );
};

export default useGetTransactionProcessSteps;
