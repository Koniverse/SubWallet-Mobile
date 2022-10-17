import { formatBalance } from '@polkadot/util';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BalanceField } from 'components/Field/Balance';
import useIsSufficientBalance from 'hooks/screen/Home/Staking/useIsSufficientBalance';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import ValidatorName from 'components/Staking/ValidatorName';
import { StakeValidatorDetailProps } from 'routes/staking/stakeAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
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
};

const HeaderContentStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  justifyContent: 'center',
  width: '80%',
};

const HeaderTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const StakeValidatorDetail = ({
  route: {
    params: { validator: validatorInfo, networkKey, networkValidatorsInfo },
  },
  navigation: { goBack },
}: StakeValidatorDetailProps) => {
  const { maxNominatorPerValidator, bondedValidators, isBondedBefore } = networkValidatorsInfo;
  const network = useGetNetworkJson(networkKey);

  const token = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const isSufficientFund = useIsSufficientBalance(networkKey, validatorInfo.minBond);

  const isBonding = useMemo(() => {
    return isBondedBefore
      ? !!bondedValidators.find(val => val.toLowerCase() === validatorInfo.address.toLowerCase())
      : false;
  }, [validatorInfo.address, bondedValidators, isBondedBefore]);

  const isMaxCommission = useMemo((): boolean => validatorInfo.commission === 100, [validatorInfo.commission]);

  const headerContent = useCallback((): JSX.Element => {
    return (
      <View style={HeaderWrapperStyle}>
        <View style={HeaderContentStyle}>
          <ValidatorName
            outerWrapperStyle={{ justifyContent: 'center' }}
            validatorInfo={validatorInfo}
            textStyle={HeaderTextStyle}
            iconColor={ColorMap.primary}
            isBonding={isBonding}
            iconSize={20}
          />
        </View>
      </View>
    );
  }, [validatorInfo, isBonding]);

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
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakeValidatorDetail);
