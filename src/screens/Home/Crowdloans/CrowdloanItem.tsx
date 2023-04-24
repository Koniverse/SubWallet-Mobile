import React from 'react';
import { Linking, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { CrowdloanItemType } from 'types/index';
import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { ContainerHorizontalPadding, FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { Logo, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  item: CrowdloanItemType;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  marginHorizontal: 16,
  marginBottom: 8,
  borderRadius: 8,
};

const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
};

const crowdloanItemPart1Style: StyleProp<any> = {
  flexDirection: 'row',
  // alignItems: 'center',
};

const crowdloanItemPart2Style: StyleProp<any> = {
  alignItems: 'flex-end',
};

const crowdloanItemMetaWrapperStyle: StyleProp<any> = {
  paddingLeft: 14,
};

const crowdloanItemTopAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const crowdloanItemMainArea: StyleProp<any> = {
  flexDirection: 'row',
  paddingVertical: 19,
  justifyContent: 'space-between',
};

const paraStateLabelWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.inputBackground,
  borderRadius: 2,
  paddingHorizontal: 8,
  paddingVertical: 1,
  marginLeft: 8,
};
const crowdloanItemSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 54,
};

function getParaStateLabelStyle(paraState: CrowdloanParaState): StyleProp<any> {
  let color: string = ColorMap.light;
  if (paraState.valueOf() === CrowdloanParaState.COMPLETED.valueOf()) {
    color = ColorMap.primary;
  }

  if (paraState === CrowdloanParaState.FAILED.valueOf()) {
    color = ColorMap.danger;
  }

  if (paraState === CrowdloanParaState.ONGOING.valueOf()) {
    color = ColorMap.warning;
  }

  return {
    ...FontSize0,
    lineHeight: 16,
    ...FontMedium,
    color: color,
  };
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
  return (
    <TouchableOpacity
      style={{ ...ContainerHorizontalPadding, ...containerStyle, backgroundColor: theme.colorBgSecondary }}
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      onPress={() => Linking.openURL(item.crowdloanUrl ? item.crowdloanUrl : '')}
      disabled={!item.crowdloanUrl}>
      <View style={crowdloanItemMainArea}>
        <View style={crowdloanItemPart1Style}>
          <View style={{ position: 'relative' }}>
            <Logo
              size={40}
              network={item.slug.toLowerCase()}
              isShowSubLogo
              subNetwork={getGroupKey(item.relayParentDisplayName)}
              subLogoShape="circle"
            />
          </View>

          <View style={crowdloanItemMetaWrapperStyle}>
            <View style={crowdloanItemTopAreaStyle}>
              <Text style={[textStyle, { maxWidth: 120 }]} numberOfLines={1}>
                {item.chainDisplayName}
              </Text>

              {!!item.paraState && (
                <View style={paraStateLabelWrapperStyle}>
                  <Text style={getParaStateLabelStyle(item.paraState)}>{getParaStateLabel(item.paraState)}</Text>
                </View>
              )}
            </View>
            <Text style={subTextStyle}>{item.relayParentDisplayName}</Text>
          </View>
        </View>
        <View style={crowdloanItemPart2Style}>
          <Number
            value={item.contribute}
            decimal={0}
            suffix={item.symbol}
            intColor={textStyle.color}
            decimalColor={subTextStyle.color}
            size={textStyle.fontSize}
          />
          <Number
            value={item.convertedContribute}
            decimal={0}
            prefix={'$'}
            unitColor={subTextStyle.color}
            intColor={subTextStyle.color}
            decimalColor={subTextStyle.color}
            size={subTextStyle.fontSize}
          />
        </View>
      </View>
      <View style={crowdloanItemSeparator} />
    </TouchableOpacity>
  );
};
