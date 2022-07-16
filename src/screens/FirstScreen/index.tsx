import React, { Suspense, useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StatusBar, StyleProp, Text, View } from 'react-native';
import { Images, SVGImages } from 'assets/index';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { ArchiveTray, Article, FileArrowUp, LockKey, UserCirclePlus } from 'phosphor-react-native';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
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

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [importSelectModalVisible, setSelectModalVisible] = useState<boolean>(false);

  const SECRET_TYPE: AccountActionType[] = [
    {
      icon: Article,
      title: i18n.common.secretPhrase,
      onCLickButton: () => {
        navigation.navigate('ImportSecretPhrase');
        setSelectModalVisible(false);
      },
    },
    {
      icon: LockKey,
      title: i18n.common.privateKey,
      onCLickButton: () => {
        navigation.navigate('ImportPrivateKey');
        setSelectModalVisible(false);
      },
    },
    {
      icon: FileArrowUp,
      title: i18n.common.jsonFile,
      onCLickButton: () => {
        navigation.navigate('RestoreJson');
        setSelectModalVisible(false);
      },
    },
  ];

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.loadingScreen} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          {
            <Suspense fallback={<View style={{ width: 230, height: 230 }} />}>
              <SVGImages.SubWallet2 width={230} height={230} />
            </Suspense>
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
