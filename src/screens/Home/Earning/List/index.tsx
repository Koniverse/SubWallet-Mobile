import React, { useEffect, useRef, useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';
import { EarningListProps } from 'routes/earning';

export const EarningList = ({
  navigation,
  route: {
    params: { step },
  },
}: EarningListProps) => {
  const data = useGroupYieldPosition();
  const hasData = !!data?.length;
  const hasDataFlag = useRef(hasData);
  const [currentStep, setCurrentStep] = useState(step || 1);
  const [firstLoading, setFirstLoading] = useState(true);
  const [positionLoading, setPositionLoading] = useState(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (hasDataFlag.current && currentStep === 2) {
        setCurrentStep(1);
      }
    });

    return unsubscribe;
  }, [currentStep, navigation]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    hasDataFlag.current = hasData;
    if (hasData) {
      setFirstLoading(false);
      setPositionLoading(false);
    } else {
      setFirstLoading(true);
      setPositionLoading(true);

      timeout = setTimeout(() => {
        setFirstLoading(false);
        setPositionLoading(false);
      }, 3000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [hasData]);

  return (
    <>
      {(hasDataFlag.current || firstLoading) && currentStep === 1 ? (
        <PositionList setStep={setCurrentStep} loading={positionLoading} />
      ) : (
        <GroupList isHasAnyPosition={!!data.length} setStep={setCurrentStep} />
      )}
    </>
  );
};
