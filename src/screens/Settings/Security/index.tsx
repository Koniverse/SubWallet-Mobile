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
import { PinCode } from 'screens/Settings/Security/PinCode';
import { updatePinCode, updatePinCodeEnable } from 'stores/SettingData';

const ViewStep = {
  SECURITY: 1,
  PIN_CODE: 2,
  REPEAT_PIN_CODE: 3,
};

export const Security = () => {
  const {
    settingData: { pinCode, pinCodeEnabled },
  } = useSelector((state: RootState) => state);
  const [isEnabledPinCode, setEnabledPinCode] = useState<boolean>(!!pinCode && pinCodeEnabled);
  const [isEnabledFaceId, setEnabledFaceId] = useState<boolean>(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.SECURITY);
  const [pinCode1, setPinCode1] = useState<string>('');
  const [repeatPinCode, setRepeatPinCode] = useState<string>('');
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();

  const onValueChangePinCode = () => {
    setEnabledPinCode(!isEnabledPinCode);
    dispatch(updatePinCodeEnable(!isEnabledPinCode));
    if (!pinCode) {
      setCurrentViewStep(ViewStep.PIN_CODE);
    }
  };

  const onValueChangeFaceId = () => {
    setEnabledFaceId(!isEnabledFaceId);
  };

  const onPressBack = () => {
    setPinCode1('');
    setRepeatPinCode('');
    if (currentViewStep === ViewStep.PIN_CODE) {
      setCurrentViewStep(ViewStep.SECURITY);
    }

    if (currentViewStep === ViewStep.REPEAT_PIN_CODE) {
      setCurrentViewStep(ViewStep.PIN_CODE);
    }

    if (!pinCode) {
      setEnabledPinCode(false);
    }
  };

  const onSavePinCode = () => {
    setEnabledPinCode(true);
    dispatch(updatePinCode(pinCode1));
    setCurrentViewStep(ViewStep.SECURITY);
  };

  const renderSecurityScreen = () => {
    return (
      <SubScreenContainer title={'Security'} navigation={navigation}>
        <View style={{ ...sharedStyles.layoutContainer }}>
          <ToggleItem label={'PIN Code'} isEnabled={isEnabledPinCode} onValueChange={onValueChangePinCode} />
          <ToggleItem
            style={{ marginBottom: 16 }}
            label={'Face ID'}
            isEnabled={isEnabledFaceId}
            onValueChange={onValueChangeFaceId}
          />

          <ActionItem
            style={{ marginBottom: 4 }}
            icon={Key}
            title={'Change your PIN code'}
            hasRightArrow
            onPress={() => {
              setCurrentViewStep(ViewStep.PIN_CODE);
              setPinCode1('');
              setRepeatPinCode('');
            }}
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

  return (
    <>
      {currentViewStep === ViewStep.SECURITY && renderSecurityScreen()}

      {currentViewStep === ViewStep.PIN_CODE && (
        <PinCode
          title={'PIN Code'}
          pinCode={pinCode1}
          onChangePinCode={setPinCode1}
          onPressBack={onPressBack}
          onPressContinue={() => {
            setCurrentViewStep(ViewStep.REPEAT_PIN_CODE);
          }}
          isPinCodeValid={true}
        />
      )}

      {currentViewStep === ViewStep.REPEAT_PIN_CODE && (
        <PinCode
          title={'Repeat PIN Code'}
          onPressBack={onPressBack}
          onPressContinue={onSavePinCode}
          pinCode={repeatPinCode}
          onChangePinCode={setRepeatPinCode}
          isPinCodeValid={repeatPinCode.length > 5 && pinCode1 === repeatPinCode}
        />
      )}
    </>
  );
};
