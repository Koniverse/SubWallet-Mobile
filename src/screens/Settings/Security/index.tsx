import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ToggleItem } from 'components/ToggleItem';
import { StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ActionItem } from 'components/ActionItem';
import { GlobeHemisphereWest, Key, LockKeyOpen } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAutoLockTime, updatePinCodeEnable } from 'stores/SettingData';
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
    settingData: { pinCode, pinCodeEnabled, autoLockTime },
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
      text: 'If left for 1 minutes',
      value: 60 * 1000,
    },
    {
      text: 'If left for 15minutes',
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
      text: 'Close App',
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

  return (
    <SubScreenContainer title={'Security'} navigation={navigation}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <ToggleItem label={'PIN Code'} isEnabled={pinCodeEnabled} onValueChange={onValueChangePinCode} />
        <ToggleItem
          style={{ marginBottom: 16 }}
          label={'Face ID'}
          isEnabled={isEnabledFaceId}
          onValueChange={onValueChangeFaceId}
        />

        <ActionItem
          disabled={!pinCode}
          style={{ marginBottom: 4 }}
          icon={Key}
          title={'Change your PIN code'}
          hasRightArrow
          onPress={() => navigation.navigate('PinCode', { isEditablePinCode: true })}
        />

        <ActionItem
          style={{ marginBottom: 4 }}
          icon={GlobeHemisphereWest}
          title={'Manage Dapp Access'}
          hasRightArrow
          onPress={() => {}}
        />

        <ActionItem
          style={{ marginBottom: 4 }}
          icon={LockKeyOpen}
          title={'App Lock'}
          hasRightArrow
          onPress={() => setIsShowAutoLockModal(true)}
        />
        <SubWalletModal
          modalVisible={iShowAutoLockModal}
          onChangeModalVisible={() => setIsShowAutoLockModal(false)}
          modalStyle={{ height: 412 }}>
          <Text style={modalTitle}>{i18n.common.selectYourSecretFile}</Text>
          {AUTO_LOCK_LIST.map(item => (
            <SelectItem
              isSelected={autoLockTime === item.value}
              label={item.text}
              onPress={() => {
                dispatch(updateAutoLockTime(item.value));
              }}
            />
          ))}
        </SubWalletModal>
      </View>
    </SubScreenContainer>
  );
};
