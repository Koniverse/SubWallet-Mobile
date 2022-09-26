import { formatBalance } from '@polkadot/util';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import { StakingDataType } from 'hooks/types';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { StakingScreenState } from 'reducers/stakingScreen';
import React, { useCallback, useMemo } from 'react';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontBold, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';

interface Props {
  stakingState: StakingScreenState;
  priceMap: Record<string, number>;
  stakingData: StakingDataType[];
}

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 16,
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

const ImageContentStyle: StyleProp<ViewStyle> = {
  width: 40,
  height: 40,
  borderRadius: 40,
  borderColor: ColorMap.secondary,
  padding: 2,
  borderWidth: 2,
  backgroundColor: ColorMap.dark,
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
};

const BalanceContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 12,
};

const BalanceConvertedContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 8,
  marginBottom: 24,
};

const BalanceTextStyle: StyleProp<TextStyle> = {
  ...FontBold,
  fontSize: 40,
  lineHeight: 56,
};

const BalanceConvertedTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

const StakingDetail = ({ stakingState, priceMap, stakingData }: Props) => {
  const toast = useToast();

  const data = useMemo((): StakingDataType | undefined => {
    return stakingData.find(item => item.key === stakingState.stakingKey);
  }, [stakingData, stakingState.stakingKey]);
  const { staking, reward } = data as StakingDataType;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chainId] || 0}`);
  }, [priceMap, staking.balance, staking.chainId]);

  const handlePressUnStake = useCallback(() => {
    toast.hideAll();
    toast.show(i18n.common.comingSoon);
  }, [toast]);

  return (
    <View style={WrapperStyle}>
      <ScrollView style={ScrollViewStyle}>
        <View style={CenterWrapperStyle}>
          <View style={ImageContentStyle}>{getNetworkLogo(staking.chainId, 32)}</View>
        </View>
        <View style={[CenterWrapperStyle, BalanceContainerStyle]}>
          <BalanceVal
            balanceValTextStyle={BalanceTextStyle}
            // symbolTextStyle={BalanceSymbolTextStyle}
            symbol={staking.nativeToken}
            withComma={true}
            value={staking.balance || '0'}
          />
        </View>
        <View style={[CenterWrapperStyle, BalanceConvertedContainerStyle]}>
          <Text style={BalanceConvertedTextStyle}>(</Text>
          <BalanceVal
            balanceValTextStyle={BalanceConvertedTextStyle}
            // symbolTextStyle={BalanceSymbolTextStyle}
            symbol={'$'}
            startWithSymbol={true}
            withComma={true}
            value={convertedBalanceValue}
          />
          <Text style={BalanceConvertedTextStyle}>)</Text>
        </View>
        <BalanceField
          label={i18n.stakingScreen.stakingDetail.activeStake}
          value={staking.activeBalance || '0'}
          token={staking.nativeToken}
          decimal={0}
          si={formatBalance.findSi('-')}
        />
        <BalanceField
          label={i18n.stakingScreen.stakingDetail.unlockingStake}
          value={staking.unlockingBalance || '0'}
          token={staking.nativeToken}
          decimal={0}
          si={formatBalance.findSi('-')}
        />
        <BalanceField
          label={i18n.stakingScreen.stakingDetail.totalReward}
          value={reward?.totalReward || '0'}
          token={staking.nativeToken}
          decimal={0}
          si={formatBalance.findSi('-')}
        />
        <BalanceField
          label={i18n.stakingScreen.stakingDetail.latestReward}
          value={reward?.latestReward || '0'}
          token={staking.nativeToken}
          decimal={0}
          si={formatBalance.findSi('-')}
        />
        <BalanceField
          label={i18n.stakingScreen.stakingDetail.totalSlash}
          value={reward?.totalSlash || '0'}
          token={staking.nativeToken}
          decimal={0}
          si={formatBalance.findSi('-')}
        />
      </ScrollView>
      <SubmitButton
        title={i18n.stakingScreen.stakingDetail.unStakeFunds}
        backgroundColor={ColorMap.danger}
        onPress={handlePressUnStake}
      />
    </View>
  );
};

export default React.memo(StakingDetail);
