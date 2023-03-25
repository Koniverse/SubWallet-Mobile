import React from 'react';
import { StyleProp, Switch, View } from 'react-native';
import Text from 'components/Text';
import { getNetworkLogo } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import {Button, Icon, Logo} from "components/design-system-ui";
import {PencilSimpleLine} from "phosphor-react-native";
interface Props {
  itemName: string;
  itemKey: string;
  isEnabled: boolean;
  onValueChange: () => void;
  isDisableSwitching?: boolean;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 6,
  alignItems: 'center',
  paddingHorizontal: 12,
  // paddingRight: 2,
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

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.light,
  borderRadius: 40,
};

export const NetworkAndTokenToggleItem = ({
  itemKey,
  itemName,
  isEnabled,
  onValueChange,
  isDisableSwitching,
}: Props) => {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <Logo size={36} network={itemKey} />
          {/*<View style={logoWrapperStyle}>{getNetworkLogo(itemKey, 40)}</View>*/}

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

        <Button
          style={{ marginLeft: 8 }}
          size={'xs'}
          type={'ghost'}
          icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={'rgba(166, 166, 166, 1)'} />}
        />
      </View>

      <View style={itemSeparator} />
    </View>
  );
};
