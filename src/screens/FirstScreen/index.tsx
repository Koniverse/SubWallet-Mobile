import React, { useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, Text, View } from 'react-native';
import { Images, SVGImages } from 'assets/index';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ArchiveTray, UserCirclePlus } from 'phosphor-react-native';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [importSelectModalVisible, setSelectModalVisible] = useState<boolean>(false);

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <ImageBackground
        source={Images.loadingScreen}
        resizeMode={'cover'}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === 'ios' ? 42 : 20,
          position: 'relative',
        }}>
        <SafeAreaView />
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          {
            // @ts-ignore
            <SVGImages.SubWallet2 width={230} height={230} />
          }
        </View>

        <SubmitButton
          leftIcon={UserCirclePlus}
          title={'Create a new wallet account'}
          style={{ marginBottom: 16, width: '100%' }}
          onPress={() => navigation.navigate('CreateAccount')}
        />

        <SubmitButton
          leftIcon={ArchiveTray}
          title={'Already have a wallet account'}
          style={{ width: '100%' }}
          backgroundColor={ColorMap.primary}
          onPress={() => setSelectModalVisible(true)}
        />

        <Text
          style={{
            ...sharedStyles.mainText,
            color: ColorMap.light,
            textAlign: 'center',
            paddingHorizontal: 60,
            paddingTop: 56,
            ...FontMedium,
          }}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>

        <SelectImportAccountModal
          modalVisible={importSelectModalVisible}
          onChangeModalVisible={() => setSelectModalVisible(false)}
        />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
