import React, { useEffect } from 'react';
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { StyleProp, TextInput, View } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontBold } from 'styles/sharedStyles';
import { CELL_COUNT } from 'constants/index';

const codeFiledRoot: StyleProp<any> = {
  marginTop: 20,
  width: 322,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const cellRoot: StyleProp<any> = {
  width: 47,
  height: 58,
  // backgroundColor: 'red',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottomColor: ColorMap.dark2,
  borderBottomWidth: 2,
};

const focusCell: StyleProp<any> = {
  borderBottomColor: ColorMap.light,
  borderBottomWidth: 2,
};

function getCellText(isPinCodeValid: boolean): StyleProp<any> {
  return {
    color: isPinCodeValid ? ColorMap.light : ColorMap.danger,
    fontSize: 32,
    lineHeight: 40,
    ...FontBold,
    textAlign: 'center',
  };
}

interface Props {
  value: string;
  setValue: (text: string) => void;
  isPinCodeValid?: boolean;
  pinCodeRef?: React.RefObject<TextInput>;
}

export const PinCodeField = ({ value, setValue, isPinCodeValid, pinCodeRef }: Props) => {
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // @ts-ignore
  const renderCell = ({ index, symbol, isFocused }) => {
    let textChild = null;

    if (symbol) {
      textChild = '*';
    } else if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <View
        // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
        onLayout={getCellOnLayoutHandler(index)}
        key={index}
        style={[cellRoot, isFocused && focusCell]}>
        <Text style={getCellText(!!isPinCodeValid)}>{textChild}</Text>
      </View>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      pinCodeRef?.current?.focus();
    }, 600);
  }, [pinCodeRef]);

  return (
    <CodeField
      ref={pinCodeRef}
      {...props}
      value={value}
      onChangeText={setValue}
      cellCount={CELL_COUNT}
      rootStyle={codeFiledRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={renderCell}
      autoFocus={true}
    />
  );
};
