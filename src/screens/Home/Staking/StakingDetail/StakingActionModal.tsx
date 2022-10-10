import { useNavigation } from '@react-navigation/native';
import { SubWalletModal } from 'components/SubWalletModal';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { StakingDataType } from 'hooks/types';
import moment from 'moment';
import { ArrowSquareDown, ClockAfternoon, IconProps, Intersect, Minus, Plus } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';

interface Props {
  visible: boolean;
  closeModal: () => void;
  data: StakingDataType;
}

interface SortItem {
  icon: (iconProps: IconProps) => JSX.Element;
  key: string;
  label: string;
  onPress: () => void;
  color?: string;
}

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 26,
};

const ItemContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const LabelTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginLeft: 16,
};

const MANUAL_CLAIM_CHAINS = ['astar', 'shibuya', 'shiden'];

const MANUAL_COMPOUND_CHAINS = ['turing', 'turingStaging'];

const StakingActionModal = ({ closeModal, visible, data }: Props) => {
  const {
    staking: { chainId: networkKey, activeBalance, unlockingInfo },
  } = data;

  const toast = useToast();

  const rootNavigation = useNavigation<RootNavigationProps>();
  const homeNavigation = useNavigation<HomeNavigationProps>();

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const networkJson = useGetNetworkJson(networkKey);

  const redeemable = useMemo((): number => unlockingInfo?.redeemable || 0, [unlockingInfo?.redeemable]);
  const nextWithdrawalAmount = useMemo(
    (): number => unlockingInfo?.nextWithdrawalAmount || 0,
    [unlockingInfo?.nextWithdrawalAmount],
  );
  const nextWithdrawal = useMemo((): number => unlockingInfo?.nextWithdrawal || 0, [unlockingInfo?.nextWithdrawal]);
  const nextWithdrawalAction = useMemo(
    (): string => unlockingInfo?.nextWithdrawalAction || '',
    [unlockingInfo?.nextWithdrawalAction],
  );
  const validatorAddress = useMemo(
    (): string => unlockingInfo?.validatorAddress || '',
    [unlockingInfo?.validatorAddress],
  );

  const canWithdraw = useMemo((): boolean => redeemable > 0, [redeemable]);

  const showClaimButton = useMemo((): boolean => MANUAL_CLAIM_CHAINS.includes(networkKey), [networkKey]);
  const showCompoundButton = useMemo((): boolean => MANUAL_COMPOUND_CHAINS.includes(networkKey), [networkKey]);

  const withdrawNote = useMemo((): string => {
    if (nextWithdrawalAmount < 0) {
      return 'Loading...';
    }

    if (redeemable > 0) {
      return `${redeemable} ${networkJson.nativeToken as string} can be withdrawn now`;
    } else {
      if (nextWithdrawal === 0 || nextWithdrawalAmount === 0) {
        return `${nextWithdrawalAmount} ${networkJson.nativeToken as string} can be withdrawn soon`;
      }

      return `${nextWithdrawalAmount} ${networkJson.nativeToken as string} can be withdrawn in ${moment
        .duration(nextWithdrawal, 'hours')
        .humanize()}`;
    }
  }, [networkJson.nativeToken, nextWithdrawal, nextWithdrawalAmount, redeemable]);

  const stakeAction = useCallback(() => {
    closeModal();
    homeNavigation.navigate('Staking', {
      screen: 'StakingValidators',
      params: {
        networkKey,
      },
    });
  }, [closeModal, homeNavigation, networkKey]);

  const unStakeAction = useCallback(() => {
    closeModal();
    rootNavigation.navigate('UnStakeAction', {
      screen: 'UnStakeConfirm',
      params: {
        selectedAccount: currentAccountAddress,
        networkKey: networkKey,
        bondedAmount: parseFloat(activeBalance || '0'),
      },
    });
  }, [activeBalance, closeModal, currentAccountAddress, networkKey, rootNavigation]);

  const withdrawAction = useCallback(() => {
    if (redeemable > 0) {
      closeModal();
      rootNavigation.navigate('WithdrawStakeAction', {
        screen: 'WithdrawAuth',
        params: {
          selectedAccount: currentAccountAddress,
          networkKey: networkKey,
          nextWithdrawalAction: nextWithdrawalAction,
          withdrawAmount: redeemable,
          targetValidator: validatorAddress,
        },
      });
    } else {
      toast.hideAll();
      toast.show(withdrawNote);
    }
  }, [
    closeModal,
    currentAccountAddress,
    networkKey,
    nextWithdrawalAction,
    redeemable,
    rootNavigation,
    toast,
    validatorAddress,
    withdrawNote,
  ]);

  const claimAction = useCallback(() => {
    closeModal();
    rootNavigation.navigate('ClaimStakeAction', {
      screen: 'ClaimAuth',
      params: {
        networkKey: networkKey,
        selectedAccount: currentAccountAddress,
      },
    });
  }, [closeModal, currentAccountAddress, networkKey, rootNavigation]);

  const compoundAction = useCallback(() => {
    toast.hideAll();
    toast.show(i18n.common.comingSoon);
  }, [toast]);

  const items = useMemo((): SortItem[] => {
    const result: SortItem[] = [
      {
        label: i18n.stakingScreen.stakingDetail.actions.stake,
        key: 'stake',
        icon: Plus,
        onPress: stakeAction,
      },
      {
        label: i18n.stakingScreen.stakingDetail.actions.unStake,
        key: 'unStake',
        icon: Minus,
        onPress: parseFloat(activeBalance || '0') > 0 ? unStakeAction : noop,
      },
      {
        label: i18n.stakingScreen.stakingDetail.actions.withdraw,
        key: 'withdraw',
        icon: ClockAfternoon,
        color: canWithdraw ? ColorMap.primary : undefined,
        onPress: canWithdraw ? withdrawAction : noop,
      },
    ];

    if (showClaimButton) {
      result.push({
        label: i18n.stakingScreen.stakingDetail.actions.claim,
        key: 'claim',
        icon: ArrowSquareDown,
        onPress: claimAction,
      });
    }

    if (showCompoundButton) {
      result.push({
        label: i18n.stakingScreen.stakingDetail.actions.compound,
        key: 'compound',
        icon: Intersect,
        onPress: compoundAction,
      });
    }

    return result;
  }, [
    activeBalance,
    canWithdraw,
    claimAction,
    compoundAction,
    showClaimButton,
    showCompoundButton,
    stakeAction,
    unStakeAction,
    withdrawAction,
  ]);

  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={closeModal}>
      <Text style={TitleTextStyle}>{i18n.common.chooseAction}</Text>
      {items.map(({ icon: Icon, onPress, key, label, color }) => {
        return (
          <TouchableOpacity style={ItemContainerStyle} key={key} activeOpacity={0.5} onPress={onPress}>
            <Icon size={20} color={color || ColorMap.disabled} />
            <Text style={LabelTextStyle}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </SubWalletModal>
  );
};

export default React.memo(StakingActionModal);
