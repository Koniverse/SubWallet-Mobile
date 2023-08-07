import React from 'react';
import { StyleProp, Switch, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';
import { BackgroundIcon, Button, Icon, Logo } from 'components/design-system-ui';
import { CircleNotch, IconProps, PencilSimpleLine, WifiHigh, WifiSlash } from 'phosphor-react-native';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';

interface Props {
  itemName: string;
  itemKey: string;
  isEnabled: boolean;
  onValueChange: () => void;
  isDisableSwitching?: boolean;
  connectionStatus?: _ChainConnectionStatus;
  onPressEditBtn?: () => void;
  showEditButton?: boolean;
  style?: ViewStyle;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 6,
  alignItems: 'center',
  paddingLeft: 12,
  paddingRight: 4,
  flex: 1,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  paddingRight: 16,
};

const itemSeparator: StyleProp<any> = {
  backgroundColor: 'rgba(33, 33, 33, 0.8)',
  height: 1,
  marginLeft: 60,
  marginRight: 12,
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 12,
  color: ColorMap.light,
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
  flex: 1,
};

const NetworkStatusIconMap: Record<
  _ChainConnectionStatus,
  {
    phosphorIcon: React.ElementType<IconProps>;
    backgroundColor: string;
  }
> = {
  [_ChainConnectionStatus.CONNECTED]: { phosphorIcon: WifiHigh, backgroundColor: '#2DA73F' },
  [_ChainConnectionStatus.DISCONNECTED]: { phosphorIcon: WifiSlash, backgroundColor: '#737373' },
  [_ChainConnectionStatus.CONNECTING]: { phosphorIcon: CircleNotch, backgroundColor: '#D9A33E' },
  [_ChainConnectionStatus.UNSTABLE]: { phosphorIcon: WifiSlash, backgroundColor: '#E68F25' },
};

export const NetworkAndTokenToggleItem = ({
  itemKey,
  itemName,
  isEnabled,
  onValueChange,
  isDisableSwitching,
  connectionStatus,
  onPressEditBtn,
  showEditButton,
  style,
}: Props) => {
  return (
    <View style={[{ marginBottom: 8 }, style]}>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <Logo
            size={36}
            network={itemKey}
            isShowSubIcon
            subIcon={
              <BackgroundIcon
                {...NetworkStatusIconMap[connectionStatus || _ChainConnectionStatus.DISCONNECTED]}
                size={'xs'}
                shape={'circle'}
              />
            }
          />

          <Text numberOfLines={1} style={itemTextStyle}>
            {itemName}
          </Text>
        </View>

        <Switch
          disabled={isDisableSwitching}
          ios_backgroundColor={ColorMap.switchInactiveButtonColor}
          value={isEnabled}
          onValueChange={onValueChange}
        />

        {showEditButton && (
          <Button
            style={{ marginLeft: 8 }}
            size={'xs'}
            type={'ghost'}
            icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={'rgba(166, 166, 166, 1)'} />}
            onPress={onPressEditBtn}
          />
        )}
      </View>

      <View style={itemSeparator} />
    </View>
  );
};
