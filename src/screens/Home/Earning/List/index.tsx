import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';
import { EarningListProps } from 'routes/earning';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

let isShowAlert = false;
export const EarningList = ({
  navigation,
  route: {
    params: { step, noAccountValid, chain, accountType },
  },
}: EarningListProps) => {
  const data = useGroupYieldPosition();
  const hasData = !!data?.length;
  const hasDataFlag = useRef(hasData);
  const { isLocked } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const [currentStep, setCurrentStep] = useState(step || 1);
  const [firstLoading, setFirstLoading] = useState(true);
  const [positionLoading, setPositionLoading] = useState(false);
  const rootNavigation = useNavigation<RootNavigationProps>();

  const chainName = useMemo(() => {
    if (chain) {
      const chainInfo = chainInfoMap[chain];
      return chainInfo?.name || '';
    } else {
      return '';
    }
  }, [chain, chainInfoMap]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (hasDataFlag.current && currentStep === 2) {
        setCurrentStep(1);
      }
    });

    return unsubscribe;
  }, [currentStep, navigation]);

  useEffect(() => {
    if (noAccountValid && !isLocked && !isShowAlert && accountType) {
      Alert.alert(
        'Invalid account type',
        `You don’t have any account to stake on ${chainName} network yet. Create a new account and try again.`,
        [
          {
            text: 'Dismiss',
            style: 'destructive',
            onPress: () => {
              isShowAlert = false;
              rootNavigation.navigate('Home', {
                screen: 'Main',
                params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: currentStep } } },
              });
            },
          },
          {
            text: 'Create new',
            onPress: () => {
              isShowAlert = false;
              rootNavigation.navigate('CreateAccount', { keyTypes: [accountType], isBack: true });
            },
          },
        ],
      );
      isShowAlert = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
