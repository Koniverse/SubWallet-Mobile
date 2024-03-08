import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Number, Typography } from 'components/design-system-ui';
import EarningTypeTag from 'components/Tag/EarningTypeTag';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { getNetworkLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { BN_TEN } from 'utils/number';
import { _ChainInfo } from '@subwallet/chain-list/types';

interface Props {
  poolInfo: YieldPoolInfo;
  onStakeMore: (value: string) => void;
  chain: _ChainInfo;
}

const EarningPoolItem = (props: Props) => {
  const { poolInfo, onStakeMore } = props;
  const { metadata, chain, type, slug } = poolInfo;
  const { inputAsset, logo, shortName } = metadata;
  const totalApy = poolInfo?.statistic?.totalApy;
  const totalApr = poolInfo?.statistic?.totalApr;
  const tvl = poolInfo?.statistic?.tvl;

  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);
  const asset = useGetChainAssetInfo(inputAsset);

  const { priceMap } = useSelector((state: RootState) => state.price);

  const apy = useMemo((): number | undefined => {
    if (totalApy) {
      return totalApy;
    }

    if (totalApr) {
      const rs = calculateReward(totalApr);

      return rs.apy;
    }

    return undefined;
  }, [totalApr, totalApy]);

  const total = useMemo((): string => {
    if (tvl && asset) {
      const priceId = asset.priceId;
      if (!priceId) {
        return '0';
      }

      const price = priceMap[priceId] || 0;

      return new BigN(tvl)
        .div(BN_TEN.pow(asset.decimals || 0))
        .multipliedBy(price)
        .toString();
    } else {
      return '';
    }
  }, [asset, priceMap, tvl]);

  return (
    <TouchableOpacity style={styleSheet.wrapper} activeOpacity={0.5} onPress={() => onStakeMore(slug)}>
      <View style={styleSheet.infoContainer}>
        {getNetworkLogo(logo || chain, 40)}
        <View style={{ flex: 1, paddingLeft: theme.paddingXS }}>
          <View style={styleSheet.containerRow}>
            <Text style={styleSheet.groupSymbol} numberOfLines={1} ellipsizeMode={'tail'}>
              {asset?.symbol || ''}
              <Text style={styleSheet.groupNetwork} numberOfLines={1} ellipsizeMode={'tail'}>
                &nbsp;({shortName})
              </Text>
            </Text>

            {apy && (
              <View style={styleSheet.dataRow}>
                <Typography.Text
                  style={{
                    ...FontMedium,
                    fontSize: theme.fontSizeSM,
                    lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                    color: theme.colorTextLight4,
                  }}>
                  Rewards:&nbsp;
                </Typography.Text>
                <Number
                  value={apy}
                  decimal={0}
                  suffix={'%'}
                  size={theme.fontSizeHeading5}
                  textStyle={{ ...FontSemiBold, lineHeight: theme.fontSizeHeading5 * theme.lineHeightHeading5 }}
                />
              </View>
            )}
          </View>
          <View style={styleSheet.containerRow}>
            <Typography.Text
              style={{
                ...FontMedium,
                fontSize: theme.fontSizeSM,
                lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                color: theme.colorTextLight4,
              }}>
              Total value staked:
            </Typography.Text>

            {total ? (
              <Number
                value={total}
                decimal={0}
                prefix={'$'}
                intColor={theme.colorSecondary}
                decimalColor={theme.colorSecondary}
                unitColor={theme.colorSecondary}
                size={theme.fontSizeSM}
                textStyle={{ ...FontMedium, lineHeight: theme.fontSizeSM * theme.lineHeightSM }}
              />
            ) : (
              <Typography.Text
                style={{
                  ...FontMedium,
                  fontSize: theme.fontSizeSM,
                  lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                  color: theme.colorSecondary,
                }}>
                TBD
              </Typography.Text>
            )}
          </View>
        </View>
      </View>

      <View style={styleSheet.poolTypeRow}>
        <EarningTypeTag type={type} chain={chain} />
      </View>
    </TouchableOpacity>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      flexDirection: 'column',
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingSM,
      paddingTop: theme.paddingSM - 1,
      paddingBottom: theme.paddingSM - 1,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },

    infoContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
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

    containerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      gap: theme.padding,
    },

    groupSymbol: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextLight1,
      flex: 1,
    },

    groupNetwork: {
      color: theme.colorTextTertiary,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.marginXXS,
      marginRight: theme.marginXXS,
    },

    dataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeXXS,
    },
  });
}

export default React.memo(EarningPoolItem);
