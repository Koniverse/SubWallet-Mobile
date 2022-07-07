import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ToggleItem } from 'components/ToggleItem';
import { View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ActionItem } from 'components/ActionItem';
import { GlobeHemisphereWest, Key, LockKeyOpen } from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updatePinCodeEnable } from 'stores/SettingData';

export const Security = () => {
  const {
    settingData: { pinCode, pinCodeEnabled },
  } = useSelector((state: RootState) => state);
  const [isEnabledFaceId, setEnabledFaceId] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(updatePinCode(''));
  //   dispatch(updatePinCodeEnable(false));
  // }, [dispatch]);

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
          onPress={() => {}}
        />
      </View>
    </SubScreenContainer>
  );
};
