import { YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Icon, Number, Typography } from 'components/design-system-ui';
import EarningTypeTag from 'components/Tag/EarningTypeTag';
import { CaretRight } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ExtraYieldPositionInfo } from 'types/earning';
import { getTokenLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { BN_TEN } from 'utils/number';

interface Props {
  positionInfo: ExtraYieldPositionInfo;
  onPress: (value: ExtraYieldPositionInfo) => () => void;
  isShowBalance?: boolean;
}

const EarningInfoItem = ({ positionInfo, onPress, isShowBalance }: Props) => {
  const { balanceToken, type, slug, group, asset, totalStake, price, exchangeRate } = positionInfo;
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const poolInfo = poolInfoMap[slug];

  const showSubLogo = useMemo(() => {
    return ![YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(type);
  }, [type]);

  const poolName = useMemo(() => {
    return (multiChainAssetMap[group] || assetRegistry[group]).symbol;
  }, [assetRegistry, group, multiChainAssetMap]);

  const balanceValue = useMemo(() => {
    return new BigN(totalStake).multipliedBy(exchangeRate);
  }, [exchangeRate, totalStake]);

  const convertedBalanceValue = useMemo(() => {
    return new BigN(balanceValue).div(BN_TEN.pow(asset.decimals || 0)).multipliedBy(price);
  }, [asset.decimals, balanceValue, price]);

  return (
    <TouchableOpacity style={styleSheet.infoContainer} activeOpacity={0.5} onPress={onPress(positionInfo)}>
      {getTokenLogo(balanceToken, showSubLogo ? poolInfo.metadata.logo || poolInfo.chain : undefined, 40)}
      <View style={{ flex: 1, paddingLeft: theme.paddingXS }}>
        <View style={styleSheet.balanceInfoRow}>
          <Text style={styleSheet.networkName} numberOfLines={1} ellipsizeMode={'tail'}>
            {poolName}
          </Text>

          {isShowBalance ? (
            <Number
              value={balanceValue}
              decimal={asset.decimals || 0}
              suffix={asset.symbol}
              textStyle={{ ...FontSemiBold }}
            />
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
          <EarningTypeTag type={type} />

          {/*<View style={{ alignItems: 'flex-start' }}>*/}
          {/*  <Tag*/}
          {/*    color={staking.type === StakingType.NOMINATED ? 'warning' : 'success'}*/}
          {/*    closable={false}*/}
          {/*    bgType={'default'}*/}
          {/*    icon={*/}
          {/*      staking.type === StakingType.NOMINATED ? (*/}
          {/*        <Icon phosphorIcon={User} size={'xxs'} weight={'bold'} iconColor={theme.colorWarning} />*/}
          {/*      ) : (*/}
          {/*        <Icon phosphorIcon={Users} size={'xxs'} weight={'bold'} iconColor={theme.colorSuccess} />*/}
          {/*      )*/}
          {/*    }>*/}
          {/*    {staking.type === StakingType.NOMINATED ? i18n.filterOptions.nominated : i18n.filterOptions.pooled}*/}
          {/*  </Tag>*/}
          {/*</View>*/}

          {isShowBalance ? (
            <Number
              value={convertedBalanceValue}
              decimal={0}
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
        <Icon phosphorIcon={CaretRight} iconColor={theme.colorTextLight3} size={'sm'} />
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

    poolTypeRow: {
      marginTop: theme.marginXS,
      borderColor: theme.colorSplit,
      borderTopWidth: 1,
      paddingTop: theme.paddingXS,
      display: 'flex',
      flexDirection: 'row',
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

export default React.memo(EarningInfoItem);
