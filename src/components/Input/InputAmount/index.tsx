import React, { ForwardedRef, forwardRef, useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import BigN from 'bignumber.js';
import { Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import InputAmountStyles from './style';

interface InputAmountProps {
  placeholder?: string;
  decimals: number;
  value: string;
  onChangeValue: (value: string) => void;
  maxValue: string;
  disable?: boolean;
  errorMessages?: string[];
  onSetMax?: (value: boolean) => void;
  showMaxButton?: boolean;
}

const isValidInput = (input: string) => {
  return !(isNaN(parseFloat(input)) || !input.match(/^-?\d*(\.\d+)?$/));
};

export const getInputValuesFromString: (input: string, power: number) => string = (input: string, power: number) => {
  const intValue = input.split('.')[0];
  let valueBigN = new BigN(isValidInput(intValue) ? intValue : '0');

  valueBigN = valueBigN.div(new BigN(10).pow(power));

  return valueBigN.toFixed();
};

export const getOutputValuesFromString: (input: string, power: number) => string = (input: string, power: number) => {
  if (!isValidInput(input)) {
    return '';
  }

  let valueBigN = new BigN(input);

  valueBigN = valueBigN.times(new BigN(10).pow(power));

  return valueBigN.toFixed().split('.')[0];
};

const Component = (props: InputAmountProps, ref: ForwardedRef<any>) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = InputAmountStyles(theme);
  const {
    decimals,
    disable,
    placeholder,
    maxValue,
    onChangeValue,
    value,
    errorMessages,
    onSetMax,
    showMaxButton = true,
  } = props;
  const [inputValue, setInputValue] = useState(value);
  const _onClickMaxBtn = useCallback(() => {
    const transformVal = getInputValuesFromString(maxValue, decimals);
    setInputValue(transformVal);
    onChangeValue(maxValue);
    onSetMax?.(true);
  }, [decimals, maxValue, onChangeValue, onSetMax]);

  const getMaxLengthText = useCallback(
    (_value: string) => {
      return _value.includes('.') ? decimals + 1 + _value.split('.')[0].length : 10;
    },
    [decimals],
  );

  const onChangeInput = useCallback(
    (_value: string) => {
      // if (!/^(0|[1-9]\d*)(\.\d*)?$/.test(_value)) {
      //   return;
      // }

      let currentValue = _value;
      const maxLength = getMaxLengthText(_value);
      if (_value.length > maxLength) {
        currentValue = _value.slice(0, maxLength);
      }

      setInputValue(currentValue);

      const transformVal = getOutputValuesFromString(currentValue, decimals);
      onChangeValue(transformVal);
      onSetMax?.(false);
    },
    [decimals, getMaxLengthText, onChangeValue, onSetMax],
  );

  return (
    <>
      <View style={_style.container}>
        <TextInput
          style={_style.inputTextStyle}
          autoCorrect={false}
          keyboardType={'decimal-pad'}
          returnKeyType={'done'}
          placeholder={placeholder || 'Amount'}
          ref={ref}
          onChangeText={onChangeInput}
          defaultValue={inputValue}
          maxLength={getMaxLengthText(inputValue)}
          placeholderTextColor={theme.colorTextTertiary}
          editable={!disable}
        />
        {showMaxButton && (
          <Button type={'ghost'} externalTextStyle={{ color: theme.colorSuccess }} size={'xs'} onPress={_onClickMaxBtn}>
            {'Max'}
          </Button>
        )}
      </View>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
};

export const InputAmount = forwardRef(Component);
