import React, { useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';
import { EarningListProps } from 'routes/earning';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const EarningList = ({
  route: {
    params: { step },
  },
}: EarningListProps) => {
  const data = useGroupYieldPosition();
  const [currentStep, setCurrentStep] = useState(step || 1);
  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  return (
    <>
      {data.length && currentStep === 1 ? (
        <PositionList setStep={setCurrentStep} isShowBalance={isShowBalance} chainInfoMap={chainInfoMap} />
      ) : (
        <GroupList
          isHasAnyPosition={!!data.length}
          setStep={setCurrentStep}
          isShowBalance={isShowBalance}
          chainInfoMap={chainInfoMap}
        />
      )}
    </>
  );
};
