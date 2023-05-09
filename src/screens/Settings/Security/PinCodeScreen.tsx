import React, { useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { PinCode } from 'screens/Settings/Security/PinCode';
import { updateFaceIdEnable, updatePinCode, updatePinCodeEnable } from 'stores/MobileSettings';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PinCodeProps, RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import bcrypt from 'react-native-bcrypt';
import i18n from 'utils/i18n/i18n';

const ViewStep = {
  VALIDATE_PIN_CODE: 1,
  PIN_CODE: 2,
  REPEAT_PIN_CODE: 3,
};

export const PinCodeScreen = ({
  route: {
    params: { screen },
  },
}: PinCodeProps) => {
  const pinCode = useSelector((state: RootState) => state.mobileSettings.pinCode);
  const navigation = useNavigation<RootNavigationProps>();
  const [currentViewStep, setCurrentViewStep] = useState<number>(
    screen === 'NewPinCode' ? ViewStep.PIN_CODE : ViewStep.VALIDATE_PIN_CODE,
  );
  const [title, setTitle] = useState(screen ? i18n.common.pinCode : i18n.common.newPinCode);
  const [validatePinCode, setValidatePinCode] = useState<string>('');
  const [newPinCode, setNewPinCode] = useState<string>('');
  const [repeatPinCode, setRepeatPinCode] = useState<string>('');
  const dispatch = useDispatch();
  const onSavePinCode = () => {
    const salt = bcrypt.genSaltSync(6);
    const hash = bcrypt.hashSync(newPinCode, salt);
    dispatch(updatePinCode(hash));
    dispatch(updatePinCodeEnable(true));
    navigation.navigate('Security');
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.VALIDATE_PIN_CODE) {
      navigation.navigate('Security');
    } else if (currentViewStep === ViewStep.PIN_CODE) {
      navigation.navigate('Security');
    } else {
      setCurrentViewStep(ViewStep.PIN_CODE);
      setTitle(i18n.common.newPinCode);
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
              if (screen === 'TurnoffPinCode') {
                dispatch(updatePinCodeEnable(false));
                dispatch(updateFaceIdEnable(false));
                dispatch(updatePinCode(''));
                navigation.navigate('Security');
              } else {
                setCurrentViewStep(ViewStep.PIN_CODE);
                setTitle(i18n.common.newPinCode);
              }
            }}
            pinCode={validatePinCode}
            onChangePinCode={setValidatePinCode}
            isPinCodeValid={
              validatePinCode.length === 6 ? !!pinCode && bcrypt.compareSync(validatePinCode, pinCode) : true
            }
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
              setTitle(i18n.common.repeatPinCode);
            }}
            isPinCodeValid={true}
          />
        )}

        {currentViewStep === ViewStep.REPEAT_PIN_CODE && (
          <PinCode
            onPressBack={() => {
              setCurrentViewStep(ViewStep.PIN_CODE);
              setTitle(i18n.common.newPinCode);
              setRepeatPinCode('');
            }}
            onPressContinue={onSavePinCode}
            pinCode={repeatPinCode}
            onChangePinCode={setRepeatPinCode}
            isPinCodeValid={repeatPinCode.length === 6 ? newPinCode === repeatPinCode : true}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};
