import React from 'react';
import { ActivityIndicator, StyleProp, TouchableOpacity, View } from 'react-native';
import Text from '../components/Text';
import { RootStackParamList } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { SpaceStyle } from 'styles/space';
import { toShort } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ColorMap } from 'styles/color';
import useGetAvatarSubIcon from 'hooks/screen/useGetAvatarSubIcon';

export interface HeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onPressSearchButton?: () => void;
}

const headerWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 40,
  position: 'relative',
  zIndex: 10,
};

const accountName: StyleProp<any> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  ...FontSemiBold,
  paddingLeft: 16,
  maxWidth: 100,
};
const accountAddress: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  paddingLeft: 4,
};
const actionButtonStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

export const Header = ({ navigation, onPressSearchButton }: HeaderProps) => {
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const isAccountWaiting = useSelector((state: RootState) => state.accounts.isWaiting);
  const SubIcon = useGetAvatarSubIcon(currentAccount, 20);

  const _onPressSearchButton = () => {
    onPressSearchButton && onPressSearchButton();
  };

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Settings');
          }}>
          <View>
            <SubWalletAvatar address={currentAccount?.address || ''} size={32} SubIcon={SubIcon} />
            {isAccountWaiting && (
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
        <Text style={accountName} numberOfLines={1}>
          {currentAccount ? currentAccount.name : ''}
        </Text>

        {!!currentAccount?.address && (
          <Text style={accountAddress}>{`(${toShort(currentAccount?.address, 4, 4)})`}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={actionButtonStyle}
          onPress={() => {
            navigation.navigate('NetworksSetting');
          }}>
          <SlidersHorizontal size={20} color={ColorMap.light} weight={'bold'} />
        </TouchableOpacity>

        <TouchableOpacity style={actionButtonStyle} onPress={_onPressSearchButton}>
          <MagnifyingGlass size={20} color={ColorMap.light} weight={'bold'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
