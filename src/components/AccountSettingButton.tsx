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
  const { currentAccount, isReady } = useSelector((state: RootState) => state.accountState);
  const currentAccountAddress = currentAccount?.address;
  const SubIcon = useGetAvatarSubIcon(currentAccount, 16);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('AccountsScreen');
      }}>
      <View>
        <SubWalletAvatar address={currentAccountAddress || ''} size={32} SubIcon={SubIcon} />
        {!isReady && (
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
