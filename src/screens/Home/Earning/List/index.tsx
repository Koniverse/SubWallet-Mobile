import React, { useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';
import { EarningListProps } from 'routes/earning';

export const EarningList = ({
  route: {
    params: { step },
  },
}: EarningListProps) => {
  const data = useGroupYieldPosition();
  const [currentStep, setCurrentStep] = useState(step || 1);
  return (
    <>
      {data.length && currentStep === 1 ? (
        <PositionList setStep={setCurrentStep} />
      ) : (
        <GroupList isHasAnyPosition={!!data.length} setStep={setCurrentStep} />
      )}
    </>
  );
};
