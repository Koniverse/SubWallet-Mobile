import React, { useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';

export const EarningList = () => {
  const data = useGroupYieldPosition();
  const [step, setStep] = useState(1);
  return (
    <>
      {data.length && step === 1 ? (
        <PositionList setStep={setStep} />
      ) : (
        <GroupList isHasAnyPosition={!!data.length} setStep={setStep} />
      )}
    </>
  );
};
