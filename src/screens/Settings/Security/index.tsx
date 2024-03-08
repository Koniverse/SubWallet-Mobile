import React, { useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ToggleItem } from 'components/ToggleItem';
import { View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { CaretRight, Key, Scan, ShieldCheck } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime, updateUseBiometric } from 'stores/MobileSettings';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem, SwModal } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import useUnlockModal, { OnCompleteType } from 'hooks/modal/useUnlockModal';
import { createKeychainPassword, getSupportedBiometryType, resetKeychainPassword } from 'utils/account';
import { keyringLock, saveAutoLockTime } from 'messaging/index';
import { requestFaceIDPermission } from 'utils/permission/biometric';
import { LockTimeout } from 'stores/types';

export const Security = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const { timeAutoLock, isUseBiometric } = useSelector((state: RootState) => state.mobileSettings);
  const [iShowAutoLockModal, setIsShowAutoLockModal] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  const modalRef = useRef<SWModalRefProps>(null);

  const AUTO_LOCK_LIST: { text: string; value: number }[] = [
    {
      text: i18n.settings.alwaysRequire,
      value: LockTimeout.ALWAYS,
    },
    {
      text: i18n.settings.ifLeftFor1Minute,
      value: LockTimeout._1MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor5Minutes,
      value: LockTimeout._5MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor10Minutes,
      value: LockTimeout._10MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor15Minutes,
      value: LockTimeout._15MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor30Minutes,
      value: LockTimeout._30MINUTE,
    },
    {
      text: i18n.settings.ifLeftFor1Hour,
      value: LockTimeout._60MINUTE,
    },
    {
      text: i18n.settings.neverRequire,
      value: LockTimeout.NEVER,
    },
  ];

  const onPasswordComplete: OnCompleteType = (password?: string) => {
    if (!password) {
      return;
    }
    createKeychainPassword(password).then(res => {
      if (res) {
        dispatch(updateUseBiometric(true));
      } else {
        dispatch(updateUseBiometric(false));
      }
    });
    if (timeAutoLock === LockTimeout.ALWAYS) {
      keyringLock().catch((e: Error) => console.log(e));
    }
  };
  const { onPress: onPressSubmit } = useUnlockModal(navigation, () => {}, true);

  const onValueChangeFaceId = () => {
    if (isUseBiometric) {
      dispatch(updateUseBiometric(false));
      resetKeychainPassword();
    } else {
      (async () => {
        const isBiometricEnabled = await getSupportedBiometryType();
        if (isBiometricEnabled) {
          onPressSubmit(onPasswordComplete)();
          return;
        }
        // if Face ID permission denied
        const result = await requestFaceIDPermission();
        if (result) {
          onPressSubmit(onPasswordComplete)();
        }
      })();
    }
  };

  const onChangeAutoLockTime = (value: number) => {
    if (value === LockTimeout.NEVER) {
      toast.show(i18n.notificationMessage.warningNeverRequirePassword, { type: 'warning', duration: 3500 });
    }
    saveAutoLockTime(value).then(() => dispatch(updateAutoLockTime(value)));
    modalRef?.current?.close();
  };

  return (
    <SubScreenContainer
      title={i18n.header.securitySettings}
      navigation={navigation}
      onPressLeftBtn={() => {
        navigation.goBack();
      }}>
      <View style={{ ...sharedStyles.layoutContainer, paddingTop: 16 }}>
        <ToggleItem
          backgroundIcon={Scan}
          backgroundIconColor={theme['magenta-7']}
          style={{ marginBottom: 16 }}
          label={i18n.settings.faceId}
          isEnabled={isUseBiometric}
          onValueChange={onValueChangeFaceId}
        />

        <View style={{ gap: theme.paddingXS }}>
          <SelectItem
            icon={Key}
            backgroundColor={theme['gold-6']}
            label={i18n.settings.changePassword}
            onPress={() => navigation.navigate('ChangePassword')}
            rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
          />

          {/*<SelectItem*/}
          {/*  icon={Globe}*/}
          {/*  backgroundColor={theme['blue-6']}*/}
          {/*  label={i18n.settings.manageWebsiteAccess}*/}
          {/*  onPress={() => navigation.navigate('DAppAccess')}*/}
          {/*  rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}*/}
          {/*/>*/}
          <SelectItem
            icon={ShieldCheck}
            backgroundColor={theme['green-6']}
            label={i18n.settings.appLock}
            onPress={() => setIsShowAutoLockModal(true)}
            rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />}
          />
        </View>

        <SwModal
          isUseModalV2
          modalBaseV2Ref={modalRef}
          setVisible={setIsShowAutoLockModal}
          modalVisible={iShowAutoLockModal}
          onBackButtonPress={() => modalRef?.current?.close()}
          modalTitle={i18n.settings.appLock}>
          <View style={{ width: '100%', gap: theme.paddingXS }}>
            {AUTO_LOCK_LIST.map(item => (
              <SelectItem
                key={item.text}
                isSelected={timeAutoLock === item.value}
                label={item.text}
                onPress={() => onChangeAutoLockTime(item.value)}
              />
            ))}
          </View>
        </SwModal>
      </View>
    </SubScreenContainer>
  );
};
