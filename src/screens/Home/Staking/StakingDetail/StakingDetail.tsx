import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import { StakingDataType } from 'hooks/types';
import { Plus } from 'phosphor-react-native';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { StakingBalanceDetailProps } from 'routes/staking/stakingScreen';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontBold, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 16,
};

const ScrollViewStyle: StyleProp<ViewStyle> = {
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 24,
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

const StakingDetail = ({
  route: {
    params: { networkKey },
  },
}: StakingBalanceDetailProps) => {
  const navigation = useNavigation<HomeNavigationProps>();
  const isAllAccount = useIsAccountAll();

  const { data: stakingData, priceMap } = useFetchStaking();

  const [visible, setVisible] = useState(false);

  const data = useMemo((): StakingDataType => {
    return stakingData.find(item => item.key === networkKey) as StakingDataType;
  }, [stakingData, networkKey]);
  const { staking, reward } = data;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chainId] || 0}`);
  }, [priceMap, staking.balance, staking.chainId]);

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.navigate('Staking', {
      screen: 'StakingBalances',
    });
  }, [navigation]);

  const handlePressStartStaking = useCallback(() => {
    navigation.navigate('Staking', {
      screen: 'StakingValidators',
      params: {
        networkKey: networkKey,
      },
    });
  }, [navigation, networkKey]);

  return (
    <ContainerWithSubHeader
      onPressBack={handleGoBack}
      title={i18n.title.staking}
      rightIcon={!isAllAccount ? Plus : undefined}
      onPressRightIcon={!isAllAccount ? handlePressStartStaking : undefined}>
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
        {!isAllAccount && (
          <SubmitButton
            style={{ marginTop: 16 }}
            title={i18n.stakingScreen.stakingDetail.moreActions}
            onPress={openModal}
          />
        )}
        <StakingActionModal closeModal={closeModal} visible={visible} data={data} />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingDetail);
