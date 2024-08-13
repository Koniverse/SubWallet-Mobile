import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { Icon, Number, Tag, Typography } from 'components/design-system-ui';
import { StakingDataType } from 'hooks/types';
import { CaretRight, User, Users } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import { getNetworkLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

interface Props {
  stakingData: StakingDataType;
  priceMap: Record<string, number>;
  onPress: (value: StakingDataType) => () => void;
  isShowBalance?: boolean;
}

const StakingBalanceItem = ({ stakingData, priceMap, onPress, isShowBalance }: Props) => {
  const { staking, decimals } = stakingData;
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);

  const networkDisplayName = useMemo((): string => {
    return staking.name.replace(' Relay Chain', '');
  }, [staking.name]);

  const symbol = staking.nativeToken;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chain] || 0}`);
  }, [priceMap, staking.balance, staking.chain]);

  return (
    <TouchableOpacity style={styleSheet.infoContainer} activeOpacity={0.5} onPress={onPress(stakingData)}>
      {getNetworkLogo(staking.chain, 40)}
      <View style={{ flex: 1, paddingLeft: theme.paddingXS }}>
        <View style={styleSheet.balanceInfoRow}>
          <Text style={styleSheet.networkName} numberOfLines={1} ellipsizeMode={'tail'}>
            {networkDisplayName}
          </Text>

          {isShowBalance ? (
            <Number value={staking.balance || 0} decimal={decimals} suffix={symbol} textStyle={{ ...FontSemiBold }} />
          ) : (
            <Typography.Text
              style={{
                fontSize: theme.fontSizeLG,
                ...FontSemiBold,
                lineHeight: theme.lineHeightLG * theme.fontSizeLG,
                color: theme.colorTextLight1,
              }}>
              ******
            </Typography.Text>
          )}
        </View>
        <View style={styleSheet.balanceInfoRow}>
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
              {staking.type === StakingType.NOMINATED ? i18n.filterOptions.nominated : i18n.filterOptions.pooled}
            </Tag>
          </View>

          {isShowBalance ? (
            <Number
              value={convertedBalanceValue}
              decimal={decimals}
              prefix={'$'}
              size={theme.fontSizeSM}
              intOpacity={0.45}
              decimalOpacity={0.45}
              unitOpacity={0.45}
              textStyle={{ ...FontMedium, lineHeight: theme.fontSizeSM * theme.lineHeightSM }}
            />
          ) : (
            <Typography.Text
              style={{
                ...FontMedium,
                fontSize: theme.fontSizeSM,
                lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                color: theme.colorTextLight4,
              }}>
              ******
            </Typography.Text>
          )}
        </View>
      </View>

      <View style={styleSheet.iconWrapper}>
        <Icon phosphorIcon={CaretRight} iconColor={theme['gray-5']} size={'sm'} />
      </View>
    </TouchableOpacity>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    infoContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingLeft: theme.paddingSM,
      paddingTop: theme.paddingSM - 1,
      paddingBottom: theme.paddingSM - 1,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
    },
    balanceInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      gap: theme.padding,
    },

    networkName: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextLight1,
      flex: 1,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.marginXXS,
      marginRight: theme.marginXXS,
    },
  });
}

export default React.memo(StakingBalanceItem);
