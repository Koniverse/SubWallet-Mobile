import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import { Logo, Number, Tag } from 'components/design-system-ui';
import { TagNativeProps } from 'components/design-system-ui/tag';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CrowdloanItemType } from 'types/index';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';

interface Props {
  item: CrowdloanItemType;
}

function getParaStateLabel(paraState: CrowdloanParaState) {
  if (paraState.valueOf() === CrowdloanParaState.COMPLETED.valueOf()) {
    return i18n.common.win;
  }

  if (paraState === CrowdloanParaState.FAILED.valueOf()) {
    return i18n.common.fail;
  }

  if (paraState === CrowdloanParaState.ONGOING.valueOf()) {
    return i18n.common.active;
  }

  return '';
}

export function getGroupKey(groupDisplayName: string) {
  if (groupDisplayName === 'Polkadot parachain') {
    return 'polkadot';
  } else {
    return 'kusama';
  }
}

export const CrowdloanItem = ({ item }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);

  const tagColor = useMemo((): TagNativeProps['color'] => {
    switch (item.paraState) {
      case CrowdloanParaState.COMPLETED:
        return 'success';
      case CrowdloanParaState.ONGOING:
        return 'warning';
      case CrowdloanParaState.FAILED:
        return 'error';
      default:
        return 'default';
    }
  }, [item.paraState]);

  return (
    <TouchableOpacity
      style={{ ...styleSheet.container, backgroundColor: theme.colorBgSecondary }}
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      onPress={() => Linking.openURL(item.crowdloanUrl ? item.crowdloanUrl : '')}
      disabled={!item.crowdloanUrl}>
      <View style={styleSheet.crowdloanItemMainArea}>
        <View style={styleSheet.crowdloanItemPart1}>
          <View style={{ position: 'relative' }}>
            <Logo
              size={40}
              network={item.slug.toLowerCase()}
              isShowSubLogo
              subNetwork={getGroupKey(item.relayParentDisplayName)}
              subLogoShape="circle"
            />
          </View>

          <View style={styleSheet.crowdloanItemMetaWrapper}>
            <View style={styleSheet.crowdloanItemTopArea}>
              <Text style={[styleSheet.text, { maxWidth: 120 }]} numberOfLines={1}>
                {item.chainDisplayName}
              </Text>

              {!!item.paraState && (
                <View style={styleSheet.paraStateLabelWrapper}>
                  <Tag closable={false} color={tagColor} bgType="default">
                    {getParaStateLabel(item.paraState)}
                  </Tag>
                </View>
              )}
            </View>
            <Text style={styleSheet.subText}>{item.relayParentDisplayName}</Text>
          </View>
        </View>
        <View style={styleSheet.crowdloanItemPart2}>
          <Number
            value={item.contribute}
            decimal={0}
            suffix={item.symbol}
            intColor={styleSheet.text.color as string}
            decimalColor={styleSheet.subText.color}
            size={styleSheet.text.fontSize}
            textStyle={{ ...styleSheet.text }}
          />
          <Number
            value={item.convertedContribute}
            decimal={0}
            prefix={'$'}
            unitColor={styleSheet.subText.color}
            intColor={styleSheet.subText.color}
            decimalColor={styleSheet.subText.color}
            size={styleSheet.subText.fontSize}
            textStyle={{ ...styleSheet.subText }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
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
