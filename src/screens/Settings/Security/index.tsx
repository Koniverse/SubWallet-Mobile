import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ToggleItem } from 'components/ToggleItem';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ActionItem } from 'components/ActionItem';
import { GlobeHemisphereWest, Key, LockKeyOpen } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime, updateFaceIdEnable } from 'stores/MobileSettings';
import { SubWalletModal } from 'components/SubWalletModal';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { SelectItem } from 'components/SelectItem';

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
    text: i18n.settings.ifLeftFor1Minutes,
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
        <ToggleItem label={i18n.common.pinCode} isEnabled={pinCodeEnabled} onValueChange={onValueChangePinCode} />
        <ToggleItem
          style={{ marginBottom: 16 }}
          label={i18n.common.faceId}
          isEnabled={faceIdEnabled}
          disabled={!pinCodeEnabled}
          onValueChange={onValueChangeFaceId}
        />

        <ActionItem
          disabled={!pinCode}
          style={{ marginBottom: 8 }}
          color={!pinCode ? ColorMap.disabledTextColor : ColorMap.light}
          icon={Key}
          title={i18n.common.changePinCode}
          hasRightArrow
          onPress={() => navigation.navigate('PinCode', { screen: 'ChangePinCode' })}
        />

        <ActionItem
          style={{ marginBottom: 8 }}
          color={ColorMap.light}
          icon={GlobeHemisphereWest}
          title={i18n.common.dApp}
          hasRightArrow
          onPress={() => navigation.navigate('DAppAccess')}
        />

        <ActionItem
          style={{ marginBottom: 4 }}
          icon={LockKeyOpen}
          title={i18n.common.manageAutoLock}
          hasRightArrow
          disabled={!pinCode}
          color={!pinCode ? ColorMap.disabledTextColor : ColorMap.light}
          onPress={() => setIsShowAutoLockModal(true)}
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
