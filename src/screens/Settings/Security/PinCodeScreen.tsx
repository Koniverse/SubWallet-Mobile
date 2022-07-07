import React, { useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { PinCode } from 'screens/Settings/Security/PinCode';
import { updatePinCode, updatePinCodeEnable } from 'stores/SettingData';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootNavigationProps, RootRouteProps } from 'types/routes';
import { RootState } from 'stores/index';

const ViewStep = {
  VALIDATE_PIN_CODE: 1,
  PIN_CODE: 2,
  REPEAT_PIN_CODE: 3,
};

export const PinCodeScreen = () => {
  const {
    settingData: { pinCode },
  } = useSelector((state: RootState) => state);
  const navigation = useNavigation<RootNavigationProps>();
  const route = useRoute<RootRouteProps>();
  const data = route.params;
  // @ts-ignore
  const isEditablePinCodeScreen = data && data.isEditablePinCode;
  const [currentViewStep, setCurrentViewStep] = useState<number>(
    isEditablePinCodeScreen ? ViewStep.VALIDATE_PIN_CODE : ViewStep.PIN_CODE,
  );
  const [title, setTitle] = useState(isEditablePinCodeScreen ? 'PIN Code' : 'New PIN Code');
  const [validatePinCode, setValidatePinCode] = useState<string>('');
  const [newPinCode, setNewPinCode] = useState<string>('');
  const [repeatPinCode, setRepeatPinCode] = useState<string>('');
  const dispatch = useDispatch();
  const onSavePinCode = () => {
    dispatch(updatePinCode(newPinCode));
    dispatch(updatePinCodeEnable(true));
    navigation.navigate('LockScreen');
  };

  return (
    <ContainerWithSubHeader title={title} onPressBack={() => {}}>
      <>
        {currentViewStep === ViewStep.VALIDATE_PIN_CODE && (
          <PinCode
            onPressBack={() => navigation.navigate('Security')}
            onPressContinue={() => {
              setCurrentViewStep(ViewStep.PIN_CODE);
              setTitle('New PIN Code');
            }}
            pinCode={validatePinCode}
            onChangePinCode={setValidatePinCode}
            isPinCodeValid={validatePinCode.length > 5 && !!pinCode && validatePinCode === pinCode}
          />
        )}

        {currentViewStep === ViewStep.PIN_CODE && (
          <PinCode
            pinCode={newPinCode}
            onChangePinCode={setNewPinCode}
            onPressBack={() => {
              // @ts-ignore
              if (data && data.isEditablePinCode) {
                setCurrentViewStep(ViewStep.VALIDATE_PIN_CODE);
                setNewPinCode('');
                setTitle('PIN Code');
              } else {
                navigation.navigate('Security');
              }
            }}
            onPressContinue={() => {
              setCurrentViewStep(ViewStep.REPEAT_PIN_CODE);
              setTitle('Repeat PIN Code');
            }}
            isPinCodeValid={true}
          />
        )}

        {currentViewStep === ViewStep.REPEAT_PIN_CODE && (
          <PinCode
            onPressBack={() => {
              setCurrentViewStep(ViewStep.PIN_CODE);
              setTitle('PIN Code');
              setRepeatPinCode('');
            }}
            onPressContinue={onSavePinCode}
            pinCode={repeatPinCode}
            onChangePinCode={setRepeatPinCode}
            isPinCodeValid={repeatPinCode.length > 5 && newPinCode === repeatPinCode}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};
