import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { ColorMap } from 'styles/color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  currentAccountAddress?: string;
  isAccountWaiting?: boolean;
}

export const AccountSettingButton = ({ navigation, currentAccountAddress, isAccountWaiting }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Settings');
      }}>
      <View>
        <SubWalletAvatar address={currentAccountAddress || ''} size={32} />
        {!!isAccountWaiting && (
          <View
            style={{
              position: 'absolute',
              backgroundColor: ColorMap.disabledOverlay,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
            }}>
            <ActivityIndicator size={18} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
