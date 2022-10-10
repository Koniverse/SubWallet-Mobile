import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { RootNavigationProps } from 'routes/index';
import ValidatorName from 'components/Staking/ValidatorName';
import { StakingValidatorDetailProps } from 'routes/staking/stakingScreen';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontBold,
  FontMedium,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 22,
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
};

const TotalStakeValTextStyle: StyleProp<TextStyle> = {
  ...FontBold,
  fontSize: 40,
  lineHeight: 56,
  marginBottom: 32,
};

const HeaderWrapperStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  justifyContent: 'center',
  flex: 1,
};

const HeaderContentStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  justifyContent: 'center',
  width: '60%',
};

const HeaderTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const StakingValidatorDetail = ({
  route: {
    params: { validatorInfo, networkValidatorsInfo, networkKey },
  },
  navigation: { goBack },
}: StakingValidatorDetailProps) => {
  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);

  const token = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const headerContent = useCallback((): JSX.Element => {
    return (
      <View style={HeaderWrapperStyle}>
        <View style={HeaderContentStyle}>
          <ValidatorName
            validatorInfo={validatorInfo}
            onlyVerifiedIcon={true}
            textStyle={HeaderTextStyle}
            iconColor={ColorMap.primary}
            iconSize={20}
          />
        </View>
      </View>
    );
  }, [validatorInfo]);

  const handlePressStaking = useCallback((): void => {
    navigation.navigate('StakeAction', {
      screen: 'StakeConfirm',
      params: {
        validator: validatorInfo,
        networkKey: networkKey,
        networkValidatorsInfo: networkValidatorsInfo,
      },
    });
  }, [navigation, networkValidatorsInfo, networkKey, validatorInfo]);

  return (
    <ContainerWithSubHeader onPressBack={goBack} headerContent={headerContent}>
      <View style={WrapperStyle}>
        <ScrollView style={ScrollViewStyle}>
          <View style={CenterWrapperStyle}>
            <Text style={TotalStakeTitleTextStyle}>Total Stake</Text>
          </View>
          <View style={CenterWrapperStyle}>
            <BalanceVal
              balanceValTextStyle={TotalStakeValTextStyle}
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
            color={ColorMap.light}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.nominatorsCount}
            value={validatorInfo.nominatorCount.toString() || '0'}
            token={''}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={ColorMap.light}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.minimumStake}
            value={validatorInfo.minBond.toString() || '0'}
            token={token}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={ColorMap.danger}
          />
          <BalanceField
            label={i18n.stakingScreen.validatorDetail.commission}
            value={validatorInfo.commission.toString() || '0'}
            token={token}
            decimal={0}
            si={formatBalance.findSi('-')}
            color={ColorMap.primary}
          />
        </ScrollView>
        <View style={{ ...MarginBottomForSubmitButton, paddingTop: 16 }}>
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
