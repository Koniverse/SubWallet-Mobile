import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ToggleItem } from 'components/ToggleItem';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ActionItem } from 'components/ActionItem';
import {
  CaretRight,
  Globe,
  GlobeHemisphereWest,
  Key,
  LockKeyOpen,
  Password,
  Scan,
  ShieldCheck,
} from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime, updateFaceIdEnable } from 'stores/MobileSettings';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';

const modalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
  textAlign: 'center',
};

const AUTO_LOCK_LIST: { text: string; value: number | undefined }[] = [
  {
    text: i18n.settings.immediately,
    value: 0,
  },
  {
    text: i18n.settings.ifLeftFor15Seconds,
    value: 15 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor30Seconds,
    value: 30 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor1Minute,
    value: 60 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor5Minutes,
    value: 5 * 60 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor15Minutes,
    value: 15 * 60 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor30Minutes,
    value: 30 * 60 * 1000,
  },
  {
    text: i18n.settings.ifLeftFor1Hour,
    value: 60 * 60 * 1000,
  },
  {
    text: i18n.settings.whenCloseApp,
    value: undefined,
  },
];

export const Security = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const { pinCode, pinCodeEnabled, autoLockTime, faceIdEnabled } = useSelector(
    (state: RootState) => state.mobileSettings,
  );
  const [iShowAutoLockModal, setIsShowAutoLockModal] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();

  const onValueChangePinCode = () => {
    if (!pinCodeEnabled) {
      navigation.navigate('PinCode', { screen: 'NewPinCode' });
    } else {
      navigation.navigate('PinCode', { screen: 'TurnoffPinCode' });
    }
  };

  const onValueChangeFaceId = () => {
    dispatch(updateFaceIdEnable(!faceIdEnabled));
  };

  const onChangeAutoLockTime = (value: number | undefined) => {
    dispatch(updateAutoLockTime(value));
    setIsShowAutoLockModal(false);
  };

  return (
    <SubScreenContainer title={i18n.title.security} navigation={navigation}>
      <View style={{ ...sharedStyles.layoutContainer, paddingTop: 16 }}>
        <ToggleItem
          backgroundIcon={Password}
          backgroundIconColor={theme['orange-7']}
          label={i18n.common.pinCode}
          isEnabled={pinCodeEnabled}
          onValueChange={onValueChangePinCode}
        />
        <ToggleItem
          backgroundIcon={Scan}
          backgroundIconColor={theme['magenta-7']}
          style={{ marginBottom: 16 }}
          label={i18n.common.faceId}
          isEnabled={faceIdEnabled}
          disabled={!pinCodeEnabled}
          onValueChange={onValueChangeFaceId}
        />

        <SelectItem
          icon={Key}
          backgroundColor={theme['gold-6']}
          label={i18n.common.changeYourPinCode}
          onPress={() => navigation.navigate('PinCode', { screen: 'ChangePinCode' })}
          rightIcon={
            <Icon
              phosphorIcon={CaretRight}
              size={'sm'}
              iconColor={!pinCode ? theme.colorTextLight5 : theme.colorWhite}
            />
          }
          disabled={!pinCode}
        />

        <SelectItem
          icon={Key}
          backgroundColor={theme['gold-6']}
          label={'Change password'}
          onPress={() => navigation.navigate('ChangePassword')}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={Globe}
          backgroundColor={theme['blue-6']}
          label={'Manage website access'}
          onPress={() => navigation.navigate('DAppAccess')}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={Globe}
          backgroundColor={theme['geekblue-6']}
          label={'Manage  WalletConnect Dapp'}
          onPress={() => {
            toast.hideAll();
            toast.show('Coming soon');
          }}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />
        <SelectItem
          icon={ShieldCheck}
          backgroundColor={theme['green-6']}
          label={i18n.common.appLock}
          onPress={() => setIsShowAutoLockModal(true)}
          rightIcon={
            <Icon
              phosphorIcon={CaretRight}
              size={'sm'}
              iconColor={!pinCode ? theme.colorTextLight5 : theme.colorWhite}
            />
          }
          disabled={!pinCode}
        />

        <SubWalletModal modalVisible={iShowAutoLockModal} onChangeModalVisible={() => setIsShowAutoLockModal(false)}>
          <View style={{ width: '100%' }}>
            <Text style={modalTitle}>{i18n.common.autoLock}</Text>
            {AUTO_LOCK_LIST.map(item => (
              <SelectItem
                key={item.text}
                isSelected={autoLockTime === item.value}
                label={item.text}
                showSeparator={false}
                onPress={() => onChangeAutoLockTime(item.value)}
              />
            ))}
          </View>
        </SubWalletModal>
      </View>
    </SubScreenContainer>
  );
};
