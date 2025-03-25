import React, { useMemo } from 'react';
import { ProcessStep } from '@subwallet/extension-base/types';
import ProcessStepItem from 'components/ProcessStepItem';
import { useGetTransactionProcessStepText } from 'hooks/transaction/process';

interface Props {
  processStep: ProcessStep;
  index: number;
  isLastItem?: boolean;
  combineInfo: unknown;
}

const Item: React.FC<Props> = (props: Props) => {
  const { combineInfo, index, isLastItem, processStep } = props;

  const getStepText = useGetTransactionProcessStepText();
  const text = useMemo(() => {
    return getStepText(processStep, combineInfo);
  }, [combineInfo, getStepText, processStep]);

  return <ProcessStepItem index={index} isLastItem={isLastItem} status={processStep.status} text={text} />;
};

export default Item;
