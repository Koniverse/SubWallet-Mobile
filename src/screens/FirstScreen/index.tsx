import React, { useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StyleProp, Text, View } from 'react-native';
import { Images, SVGImages } from 'assets/index';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ArchiveTray, Article, FileArrowUp, LockKey, UserCirclePlus } from 'phosphor-react-native';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, RootStackParamList } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import { AccountActionType } from 'types/ui-types';

const imageBackgroundStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: Platform.OS === 'ios' ? 42 : 20,
  position: 'relative',
};

const logoStyle: StyleProp<any> = { alignItems: 'center', justifyContent: 'center', flex: 1 };

const firstScreenNotificationStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
  textAlign: 'center',
  paddingHorizontal: 60,
  paddingTop: 56,
  ...FontMedium,
};

const SECRET_TYPE: AccountActionType[] = [
  {
    icon: Article,
    title: i18n.common.secretPhrase,
    navigationName: 'ImportSecretPhrase' as keyof RootStackParamList,
  },
  {
    icon: LockKey,
    title: i18n.common.privateKey,
    navigationName: 'ImportPrivateKey' as keyof RootStackParamList,
  },
  {
    icon: FileArrowUp,
    title: i18n.common.jsonFile,
    navigationName: 'RestoreJson' as keyof RootStackParamList,
  },
];

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [importSelectModalVisible, setSelectModalVisible] = useState<boolean>(false);

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <ImageBackground source={Images.loadingScreen} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          {
            // @ts-ignore
            <SVGImages.SubWallet2 width={230} height={230} />
          }
        </View>

        <SubmitButton
          leftIcon={UserCirclePlus}
          title={i18n.common.createNewWalletAccount}
          style={{ marginBottom: 16, width: '100%' }}
          onPress={() => navigation.navigate('CreateAccount')}
        />

        <SubmitButton
          leftIcon={ArchiveTray}
          title={i18n.common.alreadyHaveAWalletAccount}
          style={{ width: '100%' }}
          backgroundColor={ColorMap.primary}
          onPress={() => setSelectModalVisible(true)}
        />

        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenNotification}</Text>

        <SelectImportAccountModal
          modalHeight={256}
          secretTypeList={SECRET_TYPE}
          modalVisible={importSelectModalVisible}
          onChangeModalVisible={() => setSelectModalVisible(false)}
        />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
