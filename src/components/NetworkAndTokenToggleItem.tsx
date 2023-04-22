import React from 'react';
import { StyleProp, Switch, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';
import { BackgroundIcon, Button, Icon, Logo } from 'components/design-system-ui';
import { PencilSimpleLine, WifiHigh, WifiSlash } from 'phosphor-react-native';
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

export const NetworkAndTokenToggleItem = ({
  itemKey,
  itemName,
  isEnabled,
  onValueChange,
  isDisableSwitching,
  connectionStatus,
  onPressEditBtn,
  showEditButton,
}: Props) => {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <Logo
            size={36}
            network={itemKey}
            isShowSubIcon
            subIcon={
              <BackgroundIcon
                phosphorIcon={connectionStatus === _ChainConnectionStatus.CONNECTED ? WifiHigh : WifiSlash}
                size={'xs'}
                backgroundColor={connectionStatus === _ChainConnectionStatus.CONNECTED ? '#2DA73F' : '#737373'}
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
