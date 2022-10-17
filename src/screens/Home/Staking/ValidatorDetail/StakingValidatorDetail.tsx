import { formatBalance } from '@polkadot/util';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import useIsSufficientBalance from 'hooks/screen/Home/Staking/useIsSufficientBalance';
import useIsValidStakingNetwork from 'hooks/screen/Staking/useIsValidStakingNetwork';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import ValidatorName from 'components/Staking/ValidatorName';
import { StakingValidatorDetailProps } from 'routes/staking/stakingScreen';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontMedium,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import { parseBalanceString } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getStakingInputValueStyle } from 'utils/text';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 24,
};

const ScrollViewStyle: StyleProp<ViewStyle> = {
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const CenterWrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'row',
};

const TotalStakeTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  paddingBottom: 4,
};

const HeaderWrapperStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: 40,
  paddingRight: 40,
};

const HeaderContentStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  justifyContent: 'center',
  flex: 1,
};

const HeaderTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const checkCurrentlyBonded = (bondedValidators: string[], validatorAddress: string): boolean => {
  let isBonded = false;

  bondedValidators.forEach(bondedValidator => {
    if (bondedValidator.toLowerCase() === validatorAddress.toLowerCase()) {
      isBonded = true;
    }
  });

  return isBonded;
};

const StakingValidatorDetail = ({
  route: {
    params: { validatorInfo, networkValidatorsInfo, networkKey },
  },
  navigation: { goBack },
}: StakingValidatorDetailProps) => {
  const { bondedValidators, maxNominations, maxNominatorPerValidator, isBondedBefore } = networkValidatorsInfo;

  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();
  const isFocused = useIsFocused();

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const network = useGetNetworkJson(networkKey);
  const isNetworkValid = useIsValidStakingNetwork(networkKey);

  const token = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const isBonding = useMemo(() => {
    return isBondedBefore
      ? !!bondedValidators.find(val => val.toLowerCase() === validatorInfo.address.toLowerCase())
      : false;
  }, [validatorInfo.address, bondedValidators, isBondedBefore]);

  const isCurrentlyBonded = useMemo(
    (): boolean => checkCurrentlyBonded(bondedValidators, validatorInfo.address),
    [bondedValidators, validatorInfo.address],
  );

  const isSufficientFund = useIsSufficientBalance(networkKey, validatorInfo.minBond);

  const isMaxCommission = useMemo((): boolean => validatorInfo.commission === 100, [validatorInfo.commission]);

  const show = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text, { textStyle: { textAlign: 'center' } });
    },
    [toast],
  );

  const headerContent = useCallback((): JSX.Element => {
    return (
      <View style={HeaderWrapperStyle}>
        <View style={HeaderContentStyle}>
          <ValidatorName
            outerWrapperStyle={{ justifyContent: 'center' }}
            validatorInfo={validatorInfo}
            textStyle={HeaderTextStyle}
            iconColor={ColorMap.primary}
            iconSize={20}
            isBonding={isBonding}
          />
        </View>
      </View>
    );
  }, [validatorInfo, isBonding]);

  const handlePressStaking = useCallback((): void => {
    if (validatorInfo.hasScheduledRequest) {
      show(i18n.warningMessage.withdrawUnStakingFirst);

      return;
    }

    if (!isSufficientFund && !isCurrentlyBonded) {
      show(`${i18n.warningMessage.freeBalanceAtLeast} ${parseBalanceString(validatorInfo.minBond, token)}.`);

      return;
    }

    if (bondedValidators.length >= maxNominations && !bondedValidators.includes(validatorInfo.address)) {
      show(i18n.warningMessage.chooseNominating);

      return;
    }

    navigation.navigate('StakeAction', {
      screen: 'StakeConfirm',
      params: {
        validator: validatorInfo,
        networkKey: networkKey,
        networkValidatorsInfo: networkValidatorsInfo,
        selectedAccount: currentAccountAddress,
      },
    });
  }, [
    validatorInfo,
    isSufficientFund,
    isCurrentlyBonded,
    bondedValidators,
    maxNominations,
    navigation,
    networkKey,
    networkValidatorsInfo,
    currentAccountAddress,
    show,
    token,
  ]);

  useEffect(() => {
    const goHome = () => {
      navigation.navigate('Home', {
        screen: 'Staking',
        params: {
          screen: 'StakingBalances',
        },
      });
    };

    if (isNetworkValid) {
      return;
    }

    if (isFocused) {
      goHome();
    } else {
      const listener = navigation.addListener('focus', () => {
        goHome();
      });

      return () => {
        navigation.removeListener('focus', listener);
      };
    }
  }, [isFocused, isNetworkValid, navigation]);

  return (
    <ContainerWithSubHeader onPressBack={goBack} headerContent={headerContent}>
      <View style={WrapperStyle}>
        <ScrollView style={ScrollViewStyle} contentContainerStyle={{ ...ContainerHorizontalPadding }}>
          <View style={CenterWrapperStyle}>
            <Text style={TotalStakeTitleTextStyle}>Total Stake</Text>
          </View>
          <View style={CenterWrapperStyle}>
            <BalanceVal
              balanceValTextStyle={[
                getStakingInputValueStyle(validatorInfo.totalStake.toString()),
                { marginBottom: 32 },
              ]}
              // symbolTextStyle={BalanceSymbolTextStyle}
              symbol={token}
              withComma={true}
              value={new BigN(validatorInfo.totalStake)}
            />
          </View>
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.expected}
            value={validatorInfo.expectedReturn.toString() || '0'}
            token={'%'}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={ColorMap.primary}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.ownStake}
            value={validatorInfo.ownStake.toString() || '0'}
            token={token}
            decimal={0}
            si={formatBalance.findSi('-')}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.nominatorsCount}
            value={validatorInfo.nominatorCount.toString() || '0'}
            token={''}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={validatorInfo.nominatorCount >= maxNominatorPerValidator ? ColorMap.danger : ColorMap.disabled}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.minimumStake}
            value={validatorInfo.minBond.toString() || '0'}
            token={token}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={isSufficientFund ? ColorMap.primary : ColorMap.danger}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.commission}
            value={validatorInfo.commission.toString() || '0'}
            token={'%'}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={!isMaxCommission ? ColorMap.primary : ColorMap.danger}
          />
        </ScrollView>
        <View style={{ ...MarginBottomForSubmitButton, paddingTop: 16, ...ContainerHorizontalPadding }}>
          <SubmitButton
            title={i18n.stakingScreen.startStaking}
            backgroundColor={ColorMap.secondary}
            onPress={handlePressStaking}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingValidatorDetail);
