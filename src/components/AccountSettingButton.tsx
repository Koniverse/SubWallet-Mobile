import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { ColorMap } from 'styles/color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const AccountSettingButton = ({ navigation }: Props) => {
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const isAccountWaiting = useSelector((state: RootState) => state.accounts.isWaiting);

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
