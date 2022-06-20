import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { SpaceStyle } from 'styles/space';
import { toShort } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ColorMap } from 'styles/color';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const headerWrapper: StyleProp<any> = {
  backgroundColor: '#222222',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 8,
  paddingBottom: 8,
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

export const Header = ({ navigation }: Props) => {
  // const Logo = useSVG().Logo;
  const accountStore = useSelector((state: RootState) => state.accounts);
  const currentAccount = accountStore.currentAccount;

  return (
    <View style={[SpaceStyle.oneContainer, headerWrapper]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Settings');
          }}>
          <View>
            <SubWalletAvatar address={currentAccount?.address || ''} size={36} />
          </View>
        </TouchableOpacity>
        <Text style={accountName} numberOfLines={1}>
          {currentAccount ? currentAccount.name : ''}
        </Text>
        <Text style={accountAddress}>{`(${toShort(currentAccount?.address || '', 4, 4)})`}</Text>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={actionButtonStyle} onPress={() => navigation.navigate('NetworksSetting')}>
          <SlidersHorizontal size={20} color={'#FFF'} weight={'bold'} />
        </TouchableOpacity>

        <TouchableOpacity style={actionButtonStyle} onPress={() => navigation.navigate('NetworkSelect')}>
          <MagnifyingGlass size={20} color={'#FFF'} weight={'bold'} />
        </TouchableOpacity>
      </View>
      {/*<View style={{ flex: 1, marginLeft: -8 }}>*/}
      {/*  <TouchableWithoutFeedback*/}
      {/*    onPress={() => {*/}
      {/*      navigationRef.navigate('Home');*/}
      {/*    }}>*/}
      {/*    {*/}
      {/*      // @ts-ignore*/}
      {/*      <Logo.SubWallet width={48} height={48} />*/}
      {/*    }*/}
      {/*  </TouchableWithoutFeedback>*/}
      {/*</View>*/}
      {/*<Button style={{ marginRight: 16 }} title="Reload Background" onPress={reloadBackground} color={'secondary'} />*/}
    </View>
  );
};
