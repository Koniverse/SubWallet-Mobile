import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import { SubmitButton } from 'components/SubmitButton';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import useCurrentAccountCanSign from 'hooks/screen/useCurrentAccountCanSign';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import { StakingDataType } from 'hooks/types';
import { User, Users } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { StakingBalanceDetailProps } from 'routes/staking/stakingScreen';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import { getStakingInputValueStyle } from 'utils/text';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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
    params: { networkKey, stakingType },
  },
  navigation: { goBack },
}: StakingBalanceDetailProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccountAddress);
  const goHome = useGoHome({ screen: 'Staking', params: { screen: 'StakingBalances' } });

  useHandleGoHome({ goHome: goHome, networkKey: networkKey, networkFocusRedirect: false });

  const { data: stakingData, priceMap } = useFetchStaking();

  const [visible, setVisible] = useState(false);

  const data = useMemo((): StakingDataType => {
    return stakingData.find(
      item => item.staking.chain === networkKey && item.staking.type === stakingType,
    ) as StakingDataType;
  }, [stakingData, networkKey, stakingType]);
  const { staking, reward } = data || { staking: {}, reward: {} };
  const isCanSign = useCurrentAccountCanSign();

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chain] || 0}`);
  }, [priceMap, staking.balance, staking.chain]);

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

  if (data === undefined) {
    return <></>;
  }

  const balanceValueForStyle = staking.balance ? parseFloat(staking.balance).toFixed(2).toString() : '0';

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.stakingDetail}
      rightButtonTitle={isCanSign ? i18n.stakingScreen.stakingDetail.actions.more : undefined}
      onPressRightIcon={isCanSign ? openModal : undefined}>
      <View style={WrapperStyle}>
        <ScrollView style={ScrollViewStyle} contentContainerStyle={{ ...ContainerHorizontalPadding }}>
          <View style={[CenterWrapperStyle, { paddingTop: 24 }]}>
            <View style={ImageContentStyle}>{getNetworkLogo(staking.chain, 32)}</View>
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
          <TextField
            label={i18n.stakingScreen.stakingDetail.stakingType}
            text={stakingType === StakingType.NOMINATED ? 'Nominated' : 'Pooled'}
            textColor={stakingType === StakingType.NOMINATED ? ColorMap.disabled : ColorMap.primary}
            iconColor={stakingType === StakingType.NOMINATED ? ColorMap.disabled : ColorMap.primary}
            icon={stakingType === StakingType.NOMINATED ? User : Users}
          />
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
          {reward?.totalReward && reward?.totalSlash !== 'NaN' && (
            <BalanceField
              label={i18n.stakingScreen.stakingDetail.totalReward}
              value={reward?.totalReward || '0'}
              token={staking.nativeToken}
              decimal={0}
              si={formatBalance.findSi('-')}
            />
          )}
          {reward?.latestReward && reward?.totalSlash !== 'NaN' && (
            <BalanceField
              label={i18n.stakingScreen.stakingDetail.latestReward}
              value={reward?.latestReward || '0'}
              token={staking.nativeToken}
              decimal={0}
              si={formatBalance.findSi('-')}
            />
          )}
          {reward?.totalSlash && reward?.totalSlash !== 'NaN' && (
            <BalanceField
              label={i18n.stakingScreen.stakingDetail.totalSlash}
              value={reward?.totalSlash || '0'}
              token={staking.nativeToken}
              decimal={0}
              si={formatBalance.findSi('-')}
            />
          )}
          {stakingType === StakingType.POOLED && !isAccountAll(currentAccountAddress) && (
            <BalanceField
              label={i18n.stakingScreen.stakingDetail.unclaimedReward}
              value={reward?.unclaimedReward || '0'}
              token={staking.nativeToken}
              decimal={0}
              si={formatBalance.findSi('-')}
            />
          )}
        </ScrollView>
        {isCanSign && stakingType !== StakingType.POOLED && (
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
