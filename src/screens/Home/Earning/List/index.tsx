import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGroupYieldPosition } from 'hooks/earning';
import PositionList from 'screens/Home/Earning/PositionList';
import GroupList from 'screens/Home/Earning/GroupList';
import { EarningListProps } from 'routes/earning';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { mmkvStore } from 'utils/storage';
import BigN from 'bignumber.js';
import { updateMktCampaignStatus } from 'stores/AppState';
import WarningModal from 'components/Modal/WarningModal';

const NEED_CHECK_TO_SHOW_WARNING_SLUGS = [
  'DOT___nomination_pool___polkadot',
  'DOT___native_staking___polkadot',
  'KSM___nomination_pool___kusama',
  'KSM___native_staking___kusama',
];

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
  const [warningModalVisible, setWarningModalVisible] = useState<boolean>(false);
  const [positionLoading, setPositionLoading] = useState(false);
  const rootNavigation = useNavigation<RootNavigationProps>();
  const isOpenedWarningPopup = mmkvStore.getBoolean('isOpenedWarningPopup');
  const { yieldPositions } = useSelector((state: RootState) => state.earning);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const isShowWarningPopup = useMemo(() => {
    const filteredYieldPositionList = yieldPositions.filter(y => {
      const haveStake = new BigN(y.totalStake).gt(0);
      return NEED_CHECK_TO_SHOW_WARNING_SLUGS.includes(y.slug) && haveStake;
    });
    let filteredYieldPositionMapByAddress: Record<string, string[]> = {};

    filteredYieldPositionList.forEach(obj => {
      if (filteredYieldPositionMapByAddress[obj.address]) {
        filteredYieldPositionMapByAddress[obj.address].push(obj.slug);
      } else {
        filteredYieldPositionMapByAddress[obj.address] = [obj.slug];
      }
    });

    return Object.keys(filteredYieldPositionMapByAddress).some(address => {
      const positionSlugs = filteredYieldPositionMapByAddress[address];
      const showDotWarningPopup =
        positionSlugs.includes('DOT___nomination_pool___polkadot') &&
        positionSlugs.includes('DOT___native_staking___polkadot');

      const showKsmWarningPopup =
        positionSlugs.includes('KSM___nomination_pool___kusama') &&
        positionSlugs.includes('KSM___native_staking___kusama');
      return showDotWarningPopup || showKsmWarningPopup;
    });
  }, [yieldPositions]);

  // TODO: Remove this later because this is a hot fix for mkt campaign
  useEffect(() => {
    if (isShowWarningPopup && !isOpenedWarningPopup && isFocused) {
      setWarningModalVisible(true);
      dispatch(updateMktCampaignStatus(false));
    } else {
      dispatch(updateMktCampaignStatus(true));
    }
  }, [dispatch, isFocused, isOpenedWarningPopup, isShowWarningPopup]);

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
              rootNavigation.navigate('CreateAccount', { isBack: true });
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

      <WarningModal
        visible={warningModalVisible}
        setVisible={setWarningModalVisible}
        onPressBtn={() => {
          mmkvStore.set('isOpenedWarningPopup', true);
          setWarningModalVisible(false);
        }}
      />
    </>
  );
};
