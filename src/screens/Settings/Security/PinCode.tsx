import React from 'react';
import { StyleProp, View } from 'react-native';
import { PinCodeField } from 'components/PinCodeField';
import { useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { CELL_COUNT } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { Button } from 'components/design-system-ui';

const bottomAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  paddingHorizontal: 16,
  paddingBottom: 18,
  paddingTop: 118,
};

const cancelButtonStyle: StyleProp<any> = { flex: 1, marginRight: 6 };
const continueButtonStyle: StyleProp<any> = { flex: 1, marginLeft: 6 };
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
        <Button type={'secondary'} style={cancelButtonStyle} onPress={onPressBack}>
          {i18n.common.cancel}
        </Button>
        <Button
          disabled={!pinCode || pinCode.length !== 6 || !isPinCodeValid}
          style={continueButtonStyle}
          onPress={onPressContinue}>
          {i18n.common.continue}
        </Button>
      </View>
    </>
  );
};
