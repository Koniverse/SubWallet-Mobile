import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ToggleItem } from 'components/ToggleItem';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ActionItem } from 'components/ActionItem';
import { GlobeHemisphereWest, Key, LockKeyOpen } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime, updatePinCodeEnable } from 'stores/MobileSettings';
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

export const Security = () => {
  const {
    mobileSettings: { pinCode, pinCodeEnabled, autoLockTime },
  } = useSelector((state: RootState) => state);
  const [isEnabledFaceId, setEnabledFaceId] = useState<boolean>(false);
  const [iShowAutoLockModal, setIsShowAutoLockModal] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();

  const AUTO_LOCK_LIST: { text: string; value: number | undefined }[] = [
    {
      text: 'Immediately',
      value: 0,
    },
    {
      text: 'If left for 1 minute',
      value: 60 * 1000,
    },
    {
      text: 'If left for 15 minutes',
      value: 15 * 60 * 1000,
    },
    {
      text: 'If left for 30 minutes',
      value: 30 * 60 * 1000,
    },
    {
      text: 'If left for 1 hour',
      value: 60 * 60 * 1000,
    },
    {
      text: 'When close app',
      value: undefined,
    },
  ];

  const onValueChangePinCode = () => {
    if (!pinCodeEnabled) {
      if (pinCode) {
        dispatch(updatePinCodeEnable(true));
      } else {
        navigation.navigate('PinCode', { isEditablePinCode: false });
      }
    } else {
      dispatch(updatePinCodeEnable(false));
    }
  };

  const onValueChangeFaceId = () => {
    setEnabledFaceId(!isEnabledFaceId);
  };

  const onChangeAutoLockTime = (value: number | undefined) => {
    dispatch(updateAutoLockTime(value));
    setIsShowAutoLockModal(false);
  };

  return (
    <SubScreenContainer title={'Security'} navigation={navigation}>
      <View style={{ ...sharedStyles.layoutContainer, paddingTop: 16 }}>
        <ToggleItem label={'PIN Code'} isEnabled={pinCodeEnabled} onValueChange={onValueChangePinCode} />
        <ToggleItem
          style={{ marginBottom: 16 }}
          label={'Face ID'}
          isEnabled={isEnabledFaceId}
          disabled={true}
          onValueChange={onValueChangeFaceId}
        />

        <ActionItem
          disabled={!pinCode}
          style={{ marginBottom: 4 }}
          color={!pinCode ? ColorMap.disabledTextColor : ColorMap.light}
          icon={Key}
          title={'Change PIN code'}
          hasRightArrow
          onPress={() => navigation.navigate('PinCode', { isEditablePinCode: true })}
        />

        <ActionItem
          style={{ marginBottom: 4 }}
          disabled={true}
          color={ColorMap.disabledTextColor}
          icon={GlobeHemisphereWest}
          title={'Dapp'}
          hasRightArrow
          onPress={() => {}}
        />

        <ActionItem
          style={{ marginBottom: 4 }}
          icon={LockKeyOpen}
          title={'Manage Auto-Lock'}
          hasRightArrow
          disabled={!pinCode}
          color={!pinCode ? ColorMap.disabledTextColor : ColorMap.light}
          onPress={() => setIsShowAutoLockModal(true)}
        />
        <SubWalletModal
          modalVisible={iShowAutoLockModal}
          onChangeModalVisible={() => setIsShowAutoLockModal(false)}
          modalStyle={{ height: 412 }}>
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
