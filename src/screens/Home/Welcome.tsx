import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RootNavigationProps } from 'routes/index.ts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme.tsx';
import { SelectedActionType } from 'stores/types';
import { mmkvStore } from 'utils/storage';
import {
  DeviceEventEmitter,
  ImageBackground,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FORCE_HIDDEN_EVENT } from 'components/design-system-ui/modal/ModalBaseV2';
import { FileArrowDownIcon, PlusCircleIcon, SwatchesIcon } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n.ts';
import { Images } from 'assets/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontMedium, FontSemiBold, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes.ts';
import useSetSelectedMnemonicType from 'hooks/account/useSetSelectedMnemonicType';
import { Image } from 'components/design-system-ui';
import { SelectLanguageModal } from 'components/Modal/SelectLanguageModal.tsx';
import AccountActionButton from 'components/common/Account/AccountActionButton';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';
import { GeneralTermModal } from 'components/Modal/GeneralTermModal';
import { isHandleDeeplinkPromise, setIsHandleDeeplinkPromise } from '../../App';

export const firstScreenDeepLink: { current: string | undefined } = { current: undefined };

export function setFirstScreenDeepLink(value?: string) {
  firstScreenDeepLink.current = value;
}


export const Welcome = () => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const { hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const createAccountRef = useRef<ModalRef | null>(null);
  const importAccountRef = useRef<ModalRef | null>(null);
  const attachAccountRef = useRef<ModalRef | null>(null);
  const [generalTermVisible, setGeneralTermVisible] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [selectedActionType, setSelectedActionType] = useState<SelectedActionType>('createAcc');
  const setSelectedMnemonicType = useSetSelectedMnemonicType(false);
  const isOpenGeneralTermFirstTime = mmkvStore.getBoolean('isOpenGeneralTermFirstTime');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setIsHandleDeeplinkPromise(true);
    }
  }, [isFocused]);

  useEffect(() => {
    // Ensure modals are shown when returning to this screen on Android
    // because modal is hidden in login screen to prevent after reset account
    if (Platform.OS === 'android') {
      DeviceEventEmitter.emit(FORCE_HIDDEN_EVENT, false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = Linking.addEventListener('url', ({ url }) => {
      let _url = url;
      if (_url.includes('/transaction-action/earning')) {
        if (!_url.includes('isNoAccount=true')) {
          _url = `${url}&isNoAccount=true`;
          setFirstScreenDeepLink(_url);
          Linking.openURL(_url);
        }
      }
    });

    return () => unsubscribe.remove();
  }, []);

  useEffect(() => {
    if (isHandleDeeplinkPromise.current && isFocused) {
      Linking.getInitialURL().then(url => {
        url &&
        Linking.canOpenURL(url)
          .then(supported => {
            if (supported) {
              Linking.openURL(url);
            }
          })
          .catch(e => {
            console.warn(`Error opening URL: ${e}`);
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressActionButton = useCallback((action: SelectedActionType) => {
    return () => {
      setSelectedActionType(action);
      switch (action) {
        case 'createAcc':
          createAccountRef && createAccountRef.current?.onOpenModal();
          break;
        case 'attachAcc':
          attachAccountRef && attachAccountRef.current?.onOpenModal();
          break;
        case 'importAcc':
          importAccountRef && importAccountRef.current?.onOpenModal();
          break;
      }
    };
  }, []);

  const onPressTermsCondition = () => {
    Linking.openURL('https://docs.subwallet.app/main/privacy-and-security/terms-of-service');
  };

  const onPressPolicy = () => {
    Linking.openURL('https://docs.subwallet.app/main/privacy-and-security/terms-of-use#privacy-policy');
  };

  const onShowGeneralTermModal = (action: SelectedActionType) => {
    return () => {
      console.log('run to thisss');
      setSelectedActionType(action);
      setGeneralTermVisible(true);
    };
  };

  const onCreate = useCallback(() => {
    setSelectedMnemonicType('general');
    mmkvStore.set('use-default-create-content', false);
    console.log('hasMasterPassword', hasMasterPassword);
    if (hasMasterPassword) {
      navigation.navigate('CreateAccount', {});
    } else {
      navigation.navigate('CreatePassword', { pathName: 'CreateAccount' });
    }
  }, [hasMasterPassword, navigation, setSelectedMnemonicType]);

  const actionList = [
    {
      key: 'create',
      icon: PlusCircleIcon,
      title: i18n.welcomeScreen.createAccLabel,
      subTitle: i18n.welcomeScreen.createAccMessage,
      onPress: !isOpenGeneralTermFirstTime ? onShowGeneralTermModal('createAcc') : onCreate,
    },
    {
      key: 'import',
      icon: FileArrowDownIcon,
      title: i18n.welcomeScreen.importAccLabel,
      subTitle: i18n.welcomeScreen.importAccMessage,
      onPress: !isOpenGeneralTermFirstTime ? onShowGeneralTermModal('importAcc') : onPressActionButton('importAcc'),
    },
    {
      key: 'attach',
      icon: SwatchesIcon,
      title: i18n.welcomeScreen.attachAccLabel,
      subTitle: i18n.welcomeScreen.attachAccMessage,
      onPress: !isOpenGeneralTermFirstTime ? onShowGeneralTermModal('attachAcc') : onPressActionButton('attachAcc'),
    },
  ];

  const onPressAcceptBtn = () => {
    mmkvStore.set('isOpenGeneralTermFirstTime', true);
    setGeneralTermVisible(false);
    switch (selectedActionType) {
      case 'createAcc':
        onCreate();
        break;
      case 'importAcc':
        onPressActionButton('importAcc')();
        break;
      case 'attachAcc':
        onPressActionButton('attachAcc')();
        break;
    }
  };

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={styles.imageBackgroundStyle}>
        <SafeAreaView edges={['top']} />
        <View style={styles.logoStyle}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginBottom: 16,
              paddingTop: 40,
              alignItems: 'center',
            }}>
            <Image src={Images.SubWalletLogoGradient} style={{ width: 66, height: 100 }} />
            <Text style={styles.logoTextStyle}>SubWallet</Text>
            <Text style={styles.logoSubTextStyle}>{i18n.title.slogan}</Text>
            <SelectLanguageModal setShowLanguageModal={setShowLanguageModal} showLanguageModal={showLanguageModal} />
          </View>

          <View style={{ width: '100%' }}>
            {actionList.map(item => (
              <AccountActionButton key={item.key} item={item} />
            ))}
          </View>
        </View>

        <Text style={styles.firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart1}</Text>
        <Text style={styles.firstScreenNotificationStyle}>
          <Text onPress={onPressTermsCondition} style={{ color: theme.colorTextLight1 }}>
            {i18n.common.termAndConditions}
          </Text>
          <Text>{i18n.common.and}</Text>
          <Text onPress={onPressPolicy} style={{ color: theme.colorTextLight1 }}>
            {i18n.common.privacyPolicy}
          </Text>
        </Text>

        <AccountCreationArea
          createAccountRef={createAccountRef}
          importAccountRef={importAccountRef}
          attachAccountRef={attachAccountRef}
          allowToShowSelectType={true}
        />
        <GeneralTermModal
          modalVisible={generalTermVisible}
          setVisible={setGeneralTermVisible}
          onPressAcceptBtn={onPressAcceptBtn}
        />
        <SafeAreaView edges={['bottom']} />
      </ImageBackground>
    </View>
  );
}

function createStyle (theme: ThemeTypes) {
  return StyleSheet.create({
    imageBackgroundStyle: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 20,
      position: 'relative',
      backgroundColor: theme.colorBgSecondary
    },
    logoStyle: {
      width: '100%',
      flex: 1,
      justifyContent: 'flex-end',
      position: 'relative',
      alignItems: 'center',
      paddingBottom: 22,
    },
    logoTextStyle: {
      fontSize: 38,
      lineHeight: 46,
      ...FontSemiBold,
      color: theme.colorTextLight1,
      paddingTop: 9,
    },
    logoSubTextStyle: {
      fontSize: 16,
      lineHeight: 24,
      ...FontMedium,
      color: 'rgba(255, 255, 255, 0.65)',
      paddingTop: 12,
    },
    firstScreenNotificationStyle: {
      ...sharedStyles.smallText,
      color: 'rgba(255, 255, 255, 0.45)',
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 0,
      ...FontMedium,
    }
  })
}