import React, { useCallback, useEffect } from 'react';
import { CodeField, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { StyleProp, TextInput, View } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontBold } from 'styles/sharedStyles';
import { CELL_COUNT } from 'constants/index';
import { Squircle } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

const codeFiledRoot: StyleProp<any> = {
  marginTop: 20,
  width: 340,
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingBottom: 10,
};

const squircleLv1: StyleProp<any> = { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' };
const squircleLv2: StyleProp<any> = { width: '100%', height: '100%' };

function getCellText(): StyleProp<any> {
  return {
    color: ColorMap.light,
    fontSize: 32,
    lineHeight: 52,
    ...FontBold,
    textAlign: 'center',
  };
}

interface Props {
  value: string;
  setValue: (text: string) => void;
  setError: (text: string) => void;
  isPinCodeValid?: boolean;
  pinCodeRef?: React.RefObject<TextInput>;
}

export const PinCodeField = ({ value, setError, setValue, isPinCodeValid, pinCodeRef }: Props) => {
  const theme = useSubWalletTheme().swThemes;
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
      textChild = null;
    }

    const getBorderColor = () => {
      if (!isPinCodeValid) {
        return theme.colorError;
      }

      if (isFocused) {
        return theme.colorPrimary;
      }

      return theme.colorBgSecondary;
    };

    return (
      <Squircle key={index} containerStyle={squircleLv1} size="sm" backgroundColor={getBorderColor()}>
        <Squircle customSize={44} backgroundColor={theme.colorBgSecondary} containerStyle={squircleLv2}>
          <View onLayout={getCellOnLayoutHandler(index)} key={index}>
            <Text style={getCellText()}>{textChild}</Text>
          </View>
        </Squircle>
      </Squircle>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      pinCodeRef?.current?.focus();
    }, 1000);
  }, [pinCodeRef]);

  const onChangeText = useCallback(
    (text: string) => {
      setError && setError('');
      setValue(text);
    },
    [setError, setValue],
  );

  return (
    <CodeField
      ref={pinCodeRef}
      {...props}
      value={value}
      onChangeText={onChangeText}
      cellCount={CELL_COUNT}
      rootStyle={codeFiledRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={renderCell}
      autoFocus={false}
    />
  );
};
