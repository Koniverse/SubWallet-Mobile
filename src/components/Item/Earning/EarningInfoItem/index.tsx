import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Icon, Number, Tag, Typography } from 'components/design-system-ui';
import EarningTypeTag from 'components/Tag/EarningTypeTag';
import { CaretRight, Moon, Sun } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontBold, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ExtraYieldPositionInfo } from 'types/earning';
import { getNetworkLogo, getTokenLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { BN_TEN } from 'utils/number';
import { ImageLogosMap } from 'assets/logo';

interface Props {
  positionInfo: ExtraYieldPositionInfo;
  onPress: (value: ExtraYieldPositionInfo) => () => void;
  isShowBalance?: boolean;
}

const EarningInfoItem = ({ positionInfo, onPress, isShowBalance }: Props) => {
  const { balanceToken, type, slug, group, asset, totalStake, price, chain, currency } = positionInfo;
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const poolInfo: YieldPoolInfo | undefined = poolInfoMap[slug];
  const isTempEarningCondition = ['ASTR___native_staking___astar', 'SDN___native_staking___shiden'].includes(
    positionInfo.slug,
  );

  const poolName = useMemo(() => {
    return (multiChainAssetMap[group] || assetRegistry[group]).symbol;
  }, [assetRegistry, group, multiChainAssetMap]);

  const balanceValue = useMemo(() => {
    return new BigN(totalStake);
  }, [totalStake]);

  const convertedBalanceValue = useMemo(() => {
    return new BigN(balanceValue).div(BN_TEN.pow(asset.decimals || 0)).multipliedBy(price);
  }, [asset.decimals, balanceValue, price]);

  const getTagItem = (isTestnet: boolean) => {
    const tagContent = isTestnet ? 'Testnet' : 'Mainnet';
    const TagIcon = isTestnet ? Moon : Sun;
    const tagBgc = isTestnet ? 'rgba(217, 197, 0, 0.1)' : 'rgba(45, 167, 63, 0.1)';
    const tagColor = isTestnet ? 'yellow' : 'green';
    const tagIconColor = isTestnet ? theme['yellow-6'] : theme['green-7'];

    return (
      <Tag
        icon={<Icon phosphorIcon={TagIcon} size={'xxs'} iconColor={tagIconColor} />}
        color={tagColor}
        bgType={'default'}
        bgColor={tagBgc}>
        <Typography.Text
          ellipsis
          style={{
            fontSize: theme.fontSizeXS,
            textAlign: 'center',
            lineHeight: theme.fontSizeXS * theme.lineHeightXS,
            paddingLeft: 4,
            color: tagColor,
            flexShrink: 1,
            ...FontBold,
          }}>
          {tagContent}
        </Typography.Text>
      </Tag>
    );
  };

  const isTestnet = useMemo(() => {
    return chainInfoMap[positionInfo.chain].isTestnet;
  }, [chainInfoMap, positionInfo.chain]);

  const subnetShortName = useMemo(() => {
    return positionInfo.subnetData?.subnetShortName ? `(${positionInfo.subnetData.subnetShortName})` : '';
  }, [positionInfo.subnetData?.subnetShortName]);

  const isSubnetStaking = useMemo(
    () => !!poolInfo && [YieldPoolType.SUBNET_STAKING].includes(poolInfo.type) && !poolInfo.slug.includes('testnet'),
    [poolInfo],
  );

  if (!poolInfo) {
    return <></>;
  }

  return (
    <TouchableOpacity style={styleSheet.infoContainer} activeOpacity={0.5} onPress={onPress(positionInfo)}>
      {!isSubnetStaking || !ImageLogosMap[`subnet-${poolInfo.metadata.subnetData?.netuid || 0}`]
        ? getTokenLogo(balanceToken, poolInfo.metadata.logo || poolInfo.chain, 40)
        : getNetworkLogo(`subnet-${poolInfo.metadata.subnetData?.netuid || 0}`, 40)}
      <View style={{ flex: 1, paddingLeft: theme.paddingXS }}>
        <View style={styleSheet.balanceInfoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, overflow: 'hidden', gap: theme.sizeXXS }}>
            <View style={{ flexShrink: 1 }}>
              <Typography.Text ellipsis={true} style={styleSheet.networkName} numberOfLines={1}>
                {poolName}
              </Typography.Text>
            </View>

            <Typography.Text ellipsis={true} style={styleSheet.networkShortName} numberOfLines={1}>
              {subnetShortName}
            </Typography.Text>
          </View>

          {!isTempEarningCondition &&
            (isShowBalance ? (
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
            ))}
        </View>
        <View style={styleSheet.balanceInfoRow}>
          <View style={{ flexDirection: 'row', gap: theme.paddingXXS, flex: 1 }}>
            <EarningTypeTag type={type} chain={chain} />
            {isTestnet && getTagItem(isTestnet)}
          </View>

          {!isTempEarningCondition &&
            (isShowBalance ? (
              <Number
                value={convertedBalanceValue}
                decimal={0}
                prefix={currency?.symbol}
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
            ))}
        </View>
      </View>

      <View
        style={[
          styleSheet.iconWrapper,
          isTempEarningCondition && {
            flexDirection: 'row',
            width: '38%',
          },
        ]}>
        {isTempEarningCondition && (
          <Typography.Text style={{ color: 'rgba(255,255,255, 0.45)', marginRight: 12, fontSize: 12, lineHeight: 20 }}>
            View on dApp
          </Typography.Text>
        )}
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
      marginBottom: theme.marginXS,
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
      // flex: 1,
      width: '100%',
    },
    networkShortName: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
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
  });
}

export default React.memo(EarningInfoItem);
