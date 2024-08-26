import { Logo, Number, Tag } from 'components/design-system-ui';
import { TagNativeProps } from 'components/design-system-ui/tag';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { HideBalanceItem } from 'components/HideBalanceItem';
import { _CrowdloanItemType } from 'types/index';
import { customFormatDate } from 'utils/customFormatDate';
import { _FundStatus } from '@subwallet/chain-list/types';
import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  item: _CrowdloanItemType;
  currencyData: CurrencyJson;
  isShowBalance?: boolean;
}

function getParaStateLabel(fundStatus: _FundStatus) {
  if (fundStatus === _FundStatus.WON) {
    return 'Won';
  }

  if (fundStatus === _FundStatus.FAILED) {
    return 'Fail';
  }

  if (fundStatus === _FundStatus.WITHDRAW) {
    return 'Withdraw';
  }

  if (fundStatus === _FundStatus.IN_AUCTION) {
    return 'In auction';
  }

  return '';
}

export const CrowdloanItem = ({ item, isShowBalance, currencyData }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);

  const unlockTime = useMemo(() => {
    const date = customFormatDate(new Date(item.unlockTime), '#YYYY#-#MM#-#DD#');

    let label;

    if (item.fundStatus === _FundStatus.WON) {
      if (item.unlockTime < Date.now()) {
        label = 'Dissolved on';
      } else {
        label = 'Locked until';
      }
    } else if (item.fundStatus === _FundStatus.IN_AUCTION) {
      label = 'Crowdloan ends on';
    } else {
      label = 'Refunded on';
    }

    return `${label} ${date}`;
  }, [item.fundStatus, item.unlockTime]);

  const tagColor = useMemo((): TagNativeProps['color'] => {
    switch (item.fundStatus) {
      case _FundStatus.WON:
        return 'success';
      case _FundStatus.FAILED:
      case _FundStatus.WITHDRAW:
        return 'error';
      case _FundStatus.IN_AUCTION:
        return 'warning';
      default:
        return 'default';
    }
  }, [item.fundStatus]);

  return (
    <View style={{ ...styleSheet.container, backgroundColor: theme.colorBgSecondary }}>
      <View style={styleSheet.crowdloanItemMainArea}>
        <View style={styleSheet.crowdloanItemPart1}>
          <View style={{ position: 'relative' }}>
            <Logo
              size={40}
              network={item.chainSlug}
              isShowSubLogo
              subNetwork={item.relayChainSlug}
              subLogoShape="circle"
            />
          </View>

          <View style={styleSheet.crowdloanItemMetaWrapper}>
            <View style={styleSheet.crowdloanItemTopArea}>
              <Text style={[styleSheet.text, { maxWidth: 120 }]} numberOfLines={1}>
                {item.chainName}
              </Text>

              {!!item.fundStatus && (
                <View style={styleSheet.paraStateLabelWrapper}>
                  <Tag closable={false} color={tagColor} bgType="default">
                    {getParaStateLabel(item.fundStatus)}
                  </Tag>
                </View>
              )}
            </View>
            <Text style={styleSheet.subText}>{unlockTime}</Text>
          </View>
        </View>
        <View style={styleSheet.crowdloanItemPart2}>
          {isShowBalance && (
            <>
              <Number
                value={item.contribution.value}
                decimal={0}
                suffix={item.contribution.symbol}
                intColor={styleSheet.text.color as string}
                decimalColor={styleSheet.subText.color}
                size={styleSheet.text.fontSize}
                textStyle={{ ...styleSheet.text }}
              />
              <Number
                value={item.contribution.convertedValue}
                decimal={0}
                prefix={currencyData?.symbol}
                unitColor={styleSheet.subText.color}
                intColor={styleSheet.subText.color}
                decimalColor={styleSheet.subText.color}
                size={styleSheet.subText.fontSize}
                textStyle={{ ...styleSheet.subText }}
              />
            </>
          )}

          {!isShowBalance && <HideBalanceItem />}
        </View>
      </View>
    </View>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.marginXS,
    },

    subText: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight4,
    },

    text: {
      ...FontSemiBold,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight1,
    },

    crowdloanItemPart1: {
      flexDirection: 'row',
      // alignItems: 'center',
    },

    crowdloanItemPart2: {
      alignItems: 'flex-end',
    },

    crowdloanItemMetaWrapper: {
      paddingLeft: theme.paddingSM,
    },

    crowdloanItemTopArea: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    crowdloanItemMainArea: {
      flexDirection: 'row',
      paddingVertical: theme.paddingSM,
      justifyContent: 'space-between',
    },

    paraStateLabelWrapper: {
      marginLeft: theme.marginXS,
    },
  });
}
