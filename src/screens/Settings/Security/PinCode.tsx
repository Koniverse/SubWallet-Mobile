import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import { PinCodeField } from 'components/PinCodeField';
import { useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { CELL_COUNT } from 'constants/index';
import i18n from 'utils/i18n/i18n';

const bottomAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  paddingHorizontal: 16,
  paddingBottom: 18,
  paddingTop: 118,
};

const cancelButtonStyle: StyleProp<any> = { flex: 1, marginRight: 4, backgroundColor: ColorMap.dark2 };
const continueButtonStyle: StyleProp<any> = { flex: 1, marginLeft: 4 };
interface Props {
  pinCode: string;
  onChangePinCode: (text: string) => void;
  onPressBack: () => void;
  onPressContinue: () => void;
  isPinCodeValid?: boolean;
}

export const PinCode = ({ pinCode, onChangePinCode, onPressBack, onPressContinue, isPinCodeValid }: Props) => {
  const ref = useBlurOnFulfill({ value: pinCode, cellCount: CELL_COUNT });
  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <PinCodeField value={pinCode} setValue={onChangePinCode} isPinCodeValid={isPinCodeValid} pinCodeRef={ref} />
      </View>
      <View style={bottomAreaStyle}>
        <SubmitButton title={i18n.common.cancel} style={cancelButtonStyle} onPress={onPressBack} />
        <SubmitButton
          disabled={!pinCode || pinCode.length !== 6 || !isPinCodeValid}
          title={i18n.common.continue}
          style={continueButtonStyle}
          onPress={onPressContinue}
        />
      </View>
    </>
  );
};
