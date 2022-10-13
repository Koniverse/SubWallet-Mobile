import { formatBalance } from '@polkadot/util';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { BalanceField } from 'components/Field/Balance';
import { SubmitButton } from 'components/SubmitButton';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import { StakingDataType } from 'hooks/types';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RootNavigationProps } from 'routes/index';
import { StakingBalanceDetailProps } from 'routes/staking/stakingScreen';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import { getStakingInputValueStyle } from 'utils/text';
import useGoHome from 'hooks/screen/useGoHome';

const WrapperStyle: StyleProp<ViewStyle> = {
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

const BalanceConvertedTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

const StakingDetail = ({
  route: {
    params: { networkKey },
  },
  navigation: { goBack },
}: StakingBalanceDetailProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome({ screen: 'Staking' });
  const isFocused = useIsFocused();
  const isAllAccount = useIsAccountAll();

  const { data: stakingData, priceMap } = useFetchStaking();

  const [visible, setVisible] = useState(false);

  const data = useMemo((): StakingDataType => {
    return stakingData.find(item => item.key === networkKey) as StakingDataType;
  }, [stakingData, networkKey]);
  const { staking, reward } = data || { staking: {}, reward: {} };

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chainId] || 0}`);
  }, [priceMap, staking.balance, staking.chainId]);

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const handleStakeMore = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'Staking',
      params: {
        screen: 'StakingValidators',
        params: {
          networkKey: networkKey,
        },
      },
    });
  }, [navigation, networkKey]);

  useEffect(() => {
    if (data === undefined) {
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
    }
  }, [data, goHome, isFocused, navigation]);

  if (data === undefined) {
    return <></>;
  }

  const balanceValueForStyle = staking.balance ? parseFloat(staking.balance).toFixed(2).toString() : '0';

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.stakingDetail}
      rightButtonTitle={!isAllAccount ? i18n.stakingScreen.stakingDetail.actions.more : undefined}
      onPressRightIcon={!isAllAccount ? openModal : undefined}>
      <View style={WrapperStyle}>
        <ScrollView style={ScrollViewStyle} contentContainerStyle={{ ...ContainerHorizontalPadding }}>
          <View style={[CenterWrapperStyle, { paddingTop: 24 }]}>
            <View style={ImageContentStyle}>{getNetworkLogo(staking.chainId, 32)}</View>
          </View>
          <View style={[CenterWrapperStyle, BalanceContainerStyle]}>
            <BalanceVal
              balanceValTextStyle={getStakingInputValueStyle(balanceValueForStyle)}
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
            style={{ marginTop: 16, marginHorizontal: 16 }}
            title={i18n.stakingScreen.stakingDetail.actions.stake}
            onPress={handleStakeMore}
          />
        )}
        <StakingActionModal closeModal={closeModal} visible={visible} data={data} />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingDetail);
