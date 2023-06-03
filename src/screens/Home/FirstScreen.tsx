import { Images, SVGImages } from 'assets/index';
import { FileArrowDown, PlusCircle, Swatches } from 'phosphor-react-native';
import React, { Suspense, useCallback, useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import Text from 'components/Text';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountActionButton from 'components/common/Account/AccountActionButton';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';
import { SelectedActionType } from 'stores/types';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const imageBackgroundStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: Platform.OS === 'ios' ? 56 : 20,
  position: 'relative',
};

const logoStyle: StyleProp<any> = {
  width: '100%',
  flex: 1,
  justifyContent: 'flex-end',
  position: 'relative',
  alignItems: 'center',
  paddingBottom: 22,
};

const logoTextStyle: StyleProp<any> = {
  fontSize: 38,
  lineHeight: 46,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 9,
};

const logoSubTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontMedium,
  color: 'rgba(255, 255, 255, 0.65)',
  paddingTop: 12,
};

const firstScreenNotificationStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  color: 'rgba(255, 255, 255, 0.45)',
  textAlign: 'center',
  paddingHorizontal: 16,
  paddingTop: 0,
  ...FontMedium,
};

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const hasMasterPassword = useSelector((state: RootState) => state.accountState.hasMasterPassword);
  const [importAccountModalVisible, setImportAccountModalVisible] = useState<boolean>(false);
  const [attachAccountModalVisible, setAttachAccountModalVisible] = useState<boolean>(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState<boolean>(false);
  const theme = useSubWalletTheme().swThemes;

  const onPressActionButton = useCallback((action: SelectedActionType) => {
    return () => {
      switch (action) {
        case 'createAcc':
          setCreateAccountModalVisible(true);
          break;
        case 'attachAcc':
          setAttachAccountModalVisible(true);
          break;
        case 'importAcc':
          setImportAccountModalVisible(true);
          break;
      }
    };
  }, []);

  const onPressTermsCondition = () => {
    Linking.openURL('https://docs.subwallet.app/main/privacy-and-security/terms-of-service');
  };

  const onPressPolicy = () => {
    Linking.openURL('https://docs.subwallet.app/main/privacy-and-security/privacy-policy');
  };

  const onCreate = useCallback(() => {
    if (hasMasterPassword) {
      navigation.navigate('CreateAccount', {});
    } else {
      navigation.navigate('CreatePassword', { pathName: 'CreateAccount' });
    }
  }, [hasMasterPassword, navigation]);

  const actionList = [
    {
      key: 'create',
      icon: PlusCircle,
      title: i18n.welcomeScreen.createAccLabel,
      subTitle: i18n.welcomeScreen.createAccMessage,
      onPress: onCreate,
    },
    {
      key: 'import',
      icon: FileArrowDown,
      title: i18n.welcomeScreen.importAccLabel,
      subTitle: i18n.welcomeScreen.importAccMessage,
      onPress: onPressActionButton('importAcc'),
    },
    {
      key: 'attach',
      icon: Swatches,
      title: i18n.welcomeScreen.attachAccLabel,
      subTitle: i18n.welcomeScreen.attachAccMessage,
      onPress: onPressActionButton('attachAcc'),
    },
  ];

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginBottom: 16,
              paddingTop: 40,
              alignItems: 'center',
            }}>
            <Suspense>
              <SVGImages.LogoGradient width={66} height={100} />
            </Suspense>
            <Text style={logoTextStyle}>SubWallet</Text>
            <Text style={logoSubTextStyle}>Polkadot, Substrate & Ethereum wallet</Text>
          </View>

          <View style={{ width: '100%' }}>
            {actionList.map(item => (
              <AccountActionButton key={item.key} item={item} />
            ))}
          </View>
        </View>

        {/*//TODO: add hyperlink for T&C and Privacy Policy*/}
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart1}</Text>
        <Text style={firstScreenNotificationStyle}>
          <Text onPress={onPressTermsCondition} style={{ color: theme.colorTextLight1 }}>
            {i18n.common.termAndConditions}
          </Text>
          <Text>{i18n.common.and}</Text>
          <Text onPress={onPressPolicy} style={{ color: theme.colorTextLight1 }}>
            {i18n.common.privacyPolicy}
          </Text>
        </Text>

        <AccountCreationArea
          createAccountModalVisible={createAccountModalVisible}
          importAccountModalVisible={importAccountModalVisible}
          attachAccountModalVisible={attachAccountModalVisible}
          onChangeCreateAccountModalVisible={setCreateAccountModalVisible}
          onChangeImportAccountModalVisible={setImportAccountModalVisible}
          onChangeAttachAccountModalVisible={setAttachAccountModalVisible}
        />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
