import React, { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { TextInput, TextStyle, View } from 'react-native';
import BigN from 'bignumber.js';
import { Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import InputAmountStyles from './style';
import { DisabledStyle } from 'styles/sharedStyles';
import { setAdjustResize } from 'rn-android-keyboard-adjust';
import i18n from 'utils/i18n/i18n';

interface InputAmountProps {
  placeholder?: string;
  decimals: number;
  value: string;
  onChangeValue: (value: string, isInValid?: boolean) => void;
  maxValue: string;
  disable?: boolean;
  errorMessages?: string[];
  onSetMax?: (value: boolean) => void;
  showMaxButton?: boolean;
  forceUpdateMaxValue?: object;
  textAlign?: 'center' | 'left' | 'right';
  externalStyle?: TextStyle;
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
    forceUpdateMaxValue,
    showMaxButton = true,
    textAlign,
    externalStyle,
  } = props;
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [preservedDecimals, setPreservedDecimals] = useState(decimals);
  const [inputValue, setInputValue] = useState(value);
  const _onClickMaxBtn = useCallback(() => {
    setIsDirty(true);
    const transformVal = getInputValuesFromString(maxValue, decimals);
    setInputValue(transformVal);
    onChangeValue(maxValue, true);
    onSetMax?.(true);
  }, [decimals, maxValue, onChangeValue, onSetMax]);

  // for Android keyboard
  useEffect(() => setAdjustResize(), []);

  const getMaxLengthText = useCallback(
    (_value: string) => {
      return _value.includes('.') ? decimals + 1 + _value.split('.')[0].length : 10;
    },
    [decimals],
  );

  const onChangeInput = useCallback(
    (_rawValue: string) => {
      setIsDirty(true);
      // if (!/^(0|[1-9]\d*)(\.\d*)?$/.test(_value)) {
      //   return;
      // }

      if (!_rawValue) {
        setInputValue('');
        onChangeValue('', true);
        onSetMax?.(false);
        return;
      }

      const _value = _rawValue.replace(/,/g, '.');

      if (isValidInput(_value)) {
        let currentValue = _value;
        const maxLength = getMaxLengthText(_value);
        if (_value.length > maxLength) {
          currentValue = _value.slice(0, maxLength);
        }

        setInputValue(currentValue);

        const transformVal = getOutputValuesFromString(currentValue, decimals);

        onChangeValue(transformVal, !!transformVal || !_rawValue);
      } else {
        onChangeValue('', false);
      }

      onSetMax?.(false);
    },
    [decimals, getMaxLengthText, onChangeValue, onSetMax],
  );

  useEffect(() => {
    if (isDirty && preservedDecimals !== decimals) {
      onChangeInput(inputValue);
      setPreservedDecimals(decimals);
    }
  }, [preservedDecimals, decimals, inputValue, onChangeInput, isDirty]);

  useEffect(() => {
    if (forceUpdateMaxValue) {
      const transformVal = getInputValuesFromString(maxValue, decimals);

      setInputValue(transformVal);
      onChangeValue(maxValue, true);
    }
  }, [decimals, forceUpdateMaxValue, maxValue, onChangeValue]);

  useEffect(() => {
    if (inputValue && inputValue.length > (getMaxLengthText(inputValue) || 0)) {
      let valueStr = inputValue.toString();
      const decimalPointIndex = valueStr.indexOf('.');

      if (decimalPointIndex !== -1) {
        valueStr = valueStr.slice(0, decimalPointIndex + decimals + 1);
        valueStr = valueStr.replace(/0+$/, '');

        if (valueStr.endsWith('.')) {
          valueStr = valueStr.slice(0, -1);
        }
      }

      setInputValue(valueStr);
    }
  }, [decimals, getMaxLengthText, inputValue, value]);

  return (
    <>
      <View style={[_style.container, disable && DisabledStyle]}>
        <TextInput
          style={[_style.inputTextStyle, externalStyle]}
          autoCorrect={false}
          keyboardType={'decimal-pad'}
          returnKeyType={'done'}
          placeholder={placeholder || i18n.placeholder.amount}
          ref={ref}
          onChangeText={onChangeInput}
          defaultValue={inputValue}
          maxLength={getMaxLengthText(inputValue)}
          placeholderTextColor={theme.colorTextLight4}
          editable={!disable}
          textAlign={textAlign}
        />
        {showMaxButton && (
          <Button
            disabled={disable}
            type={'ghost'}
            externalTextStyle={{ color: theme.colorSuccess }}
            size={'xs'}
            onPress={_onClickMaxBtn}>
            {i18n.common.max}
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
