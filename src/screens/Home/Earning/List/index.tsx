import React, { useEffect, useRef, useState } from 'react';
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
  const positionLengthRef = useRef<number>(data.length);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading && data.length) {
      setTimeout(() => {
        positionLengthRef.current = data.length;
        setLoading(false);
      }, 3000);
    }
  }, [data.length, loading]);

  const [currentStep, setCurrentStep] = useState(step || 1);
  return (
    <>
      {!!positionLengthRef.current && currentStep === 1 ? (
        <PositionList setStep={setCurrentStep} setLoading={setLoading} loading={loading} />
      ) : (
        <GroupList isHasAnyPosition={!!data.length} setStep={setCurrentStep} />
      )}
    </>
  );
};
