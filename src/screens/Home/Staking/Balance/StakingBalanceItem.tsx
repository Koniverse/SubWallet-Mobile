import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { Icon, Tag, Number } from 'components/design-system-ui';
import { StakingDataType } from 'hooks/types';
import {CaretRight, User, Users} from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import { getNetworkLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  stakingData: StakingDataType;
  priceMap: Record<string, number>;
  onPress: (value: StakingDataType) => () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
  paddingHorizontal: 16,
};

const InfoContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 11,
  paddingBottom: 11,
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
  marginBottom: 8,
  alignItems: 'center',
};
const NetworkInfoWrapperStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'hidden',
  flex: 5,
};

const NetworkInfoContentStyle: StyleProp<ViewStyle> = {
  paddingLeft: 8,
  paddingRight: 8,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const NetworkNameStyle: StyleProp<TextStyle> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
  color: ColorMap.light,
};

const BalanceInfoContainerStyle: StyleProp<ViewStyle> = {
  alignItems: 'flex-end',
  paddingLeft: 2,
  paddingRight: 12,
};

const StakingBalanceItem = ({ stakingData, priceMap, onPress }: Props) => {
  const { staking, decimals } = stakingData;
  const theme = useSubWalletTheme().swThemes;

  const networkDisplayName = useMemo((): string => {
    return staking.name.replace(' Relay Chain', '');
  }, [staking.name]);

  const symbol = staking.nativeToken;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chain] || 0}`);
  }, [priceMap, staking.balance, staking.chain]);

  return (
    <TouchableOpacity style={WrapperStyle} activeOpacity={0.5} onPress={onPress(stakingData)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {getNetworkLogo(staking.chain, 40)}
          <View style={NetworkInfoContentStyle}>
            <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {networkDisplayName}
            </Text>
            <View style={{ alignItems: 'flex-start' }}>
              <Tag
                color={staking.type === StakingType.NOMINATED ? 'warning' : 'success'}
                closable={false}
                bgType={'default'}
                icon={
                  staking.type === StakingType.NOMINATED ? (
                    <Icon phosphorIcon={User} size={'xxs'} weight={'bold'} iconColor={theme.colorWarning} />
                  ) : (
                    <Icon phosphorIcon={Users} size={'xxs'} weight={'bold'} iconColor={theme.colorSuccess} />
                  )
                }>
                {staking.type === StakingType.NOMINATED ? 'Nominated' : 'Pooled'}
              </Tag>
            </View>
          </View>
        </View>

        <View style={BalanceInfoContainerStyle}>
          <Number value={staking.balance || 0} decimal={decimals} suffix={symbol} textStyle={{ ...FontSemiBold }} />

          <Number
            value={convertedBalanceValue}
            decimal={decimals}
            prefix={'$'}
            size={theme.fontSizeSM}
            intOpacity={0.45}
            decimalOpacity={0.45}
            unitOpacity={0.45}
            textStyle={{ ...FontMedium }}
          />
        </View>
        <Icon phosphorIcon={CaretRight} iconColor={theme.colorTextLight3} size={'md'} />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(StakingBalanceItem);
