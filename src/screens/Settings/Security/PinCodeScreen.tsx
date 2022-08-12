import React, { useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { PinCode } from 'screens/Settings/Security/PinCode';
import { updatePinCode, updatePinCodeEnable } from 'stores/SettingData';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PinCodeProps, RootNavigationProps } from 'types/routes';
import { RootState } from 'stores/index';
import bcrypt from 'react-native-bcrypt';

const ViewStep = {
  VALIDATE_PIN_CODE: 1,
  PIN_CODE: 2,
  REPEAT_PIN_CODE: 3,
};

export const PinCodeScreen = ({
  route: {
    params: { isEditablePinCode },
  },
}: PinCodeProps) => {
  const {
    settingData: { pinCode },
  } = useSelector((state: RootState) => state);
  const navigation = useNavigation<RootNavigationProps>();
  const [currentViewStep, setCurrentViewStep] = useState<number>(
    isEditablePinCode ? ViewStep.VALIDATE_PIN_CODE : ViewStep.PIN_CODE,
  );
  const [title, setTitle] = useState(isEditablePinCode ? 'PIN Code' : 'New PIN Code');
  const [validatePinCode, setValidatePinCode] = useState<string>('');
  const [newPinCode, setNewPinCode] = useState<string>('');
  const [repeatPinCode, setRepeatPinCode] = useState<string>('');
  const dispatch = useDispatch();
  const onSavePinCode = () => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPinCode, salt);
    dispatch(updatePinCode(hash));
    dispatch(updatePinCodeEnable(true));
    navigation.navigate('LockScreen');
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.VALIDATE_PIN_CODE) {
      navigation.navigate('Security');
    } else if (currentViewStep === ViewStep.PIN_CODE) {
      navigation.navigate('Security');
    } else {
      setCurrentViewStep(ViewStep.PIN_CODE);
      setTitle('New PIN Code');
      setRepeatPinCode('');
    }
  };

  return (
    <ContainerWithSubHeader title={title} onPressBack={onPressBack}>
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
            isPinCodeValid={validatePinCode.length > 5 && !!pinCode && bcrypt.compareSync(validatePinCode, pinCode)}
          />
        )}

        {currentViewStep === ViewStep.PIN_CODE && (
          <PinCode
            pinCode={newPinCode}
            onChangePinCode={setNewPinCode}
            onPressBack={() => {
              navigation.navigate('Security');
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
              setTitle('New PIN Code');
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
