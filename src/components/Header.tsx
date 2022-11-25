import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconButton } from 'components/IconButton';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { List, MagnifyingGlass, QrCode } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleProp, TouchableOpacity, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { useSelector } from 'react-redux';
import { RootStackParamList } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { SpaceStyle } from 'styles/space';
import { requestCameraPermission } from 'utils/permission/camera';
import Text from '../components/Text';

export interface HeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onPressSearchButton?: () => void;
}

const headerWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  position: 'relative',
  zIndex: 10,
};

const accountName: StyleProp<any> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  ...FontSemiBold,
  paddingLeft: 8,
  maxWidth: 120,
};

export const Header = ({ navigation, onPressSearchButton }: HeaderProps) => {
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const isAccountWaiting = useSelector((state: RootState) => state.accounts.isWaiting);

  const _onPressSearchButton = () => {
    onPressSearchButton && onPressSearchButton();
  };

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      navigation.navigate('SigningAction', {
        screen: 'SigningScanPayload',
      });
    }
  }, [navigation]);

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ position: 'absolute', left: 16 }}>
        <IconButton
          icon={List}
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AccountsScreen');
          }}>
          <View style={{ flexDirection: 'row' }}>
            <SubWalletAvatar address={currentAccount?.address || ''} size={16} />
            {isAccountWaiting && (
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: ColorMap.disabledOverlay,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size={4} />
              </View>
            )}
            <Text style={accountName} numberOfLines={1}>
              {currentAccount ? currentAccount.name : ''}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', position: 'absolute', right: 16 }}>
        <IconButton icon={QrCode} onPress={onPressQrButton} />

        <IconButton icon={MagnifyingGlass} onPress={_onPressSearchButton} />
      </View>
    </View>
  );
};
