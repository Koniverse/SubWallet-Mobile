import useGetAvatarSubIcon from 'hooks/screen/useGetAvatarSubIcon';
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
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const isAccountWaiting = useSelector((state: RootState) => state.accounts.isWaiting);
  const SubIcon = useGetAvatarSubIcon(currentAccount, 20);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Settings');
      }}>
      <View>
        <SubWalletAvatar address={currentAccountAddress || ''} size={32} SubIcon={SubIcon} />
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
