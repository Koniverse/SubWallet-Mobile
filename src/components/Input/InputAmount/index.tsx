import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput, TextStyle, View } from 'react-native';
import BigN from 'bignumber.js';
import { Button, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import InputAmountStyles from './style';
import { DisabledStyle, FontMedium } from 'styles/sharedStyles';
import { setAdjustResize } from 'rn-android-keyboard-adjust';
import i18n from 'utils/i18n/i18n';
import { useForwardFieldRef } from 'hooks/useForwardFieldRef';

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
  label?: string;
  defaultInvalidOutputValue?: string;
}

const isValidInput = (input: string) => {
  return !(isNaN(parseFloat(input)) || !input.match(/^-?\d*(\.\d+)?$/));
};

export const getInputValuesFromString = (input: string, power: number): string => {
  const intValue = input.split('.')[0];
  let valueBigN = new BigN(isValidInput(intValue) ? intValue : '0');

  valueBigN = valueBigN.div(new BigN(10).pow(power));

  return valueBigN.toFixed();
};

export const getOutputValuesFromString = (input: string, power: number, defaultInvalidOutputValue = ''): string => {
  if (!isValidInput(input)) {
    return defaultInvalidOutputValue;
  }

  let valueBigN = new BigN(input);

  valueBigN = valueBigN.times(new BigN(10).pow(power));

  return valueBigN.toFixed().split('.')[0];
};

const Component = (props: InputAmountProps, ref: ForwardedRef<TextInput>) => {
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
    label,
    defaultInvalidOutputValue,
  } = props;
  const inputRef = useForwardFieldRef(ref);
  const [inputValue, setInputValue] = useState(value ? getInputValuesFromString(value, decimals) : value);
  const [firstTime, setFirstTime] = useState(true);
  const _onPressMaxBtn = useCallback(() => {
    inputRef.current?.focus();
    const transformVal = getInputValuesFromString(maxValue, decimals);
    setInputValue(transformVal);
    setFirstTime(false);
    onChangeValue(maxValue, true);
    onSetMax?.(true);
    inputRef.current?.blur();
  }, [decimals, inputRef, maxValue, onChangeValue, onSetMax]);

  // for Android keyboard
  useEffect(() => setAdjustResize(), []);

  const getMaxLengthText = useCallback(
    (_value: string) => {
      return _value.includes('.') ? decimals + 1 + _value.split('.')[0].length : 10;
    },
    [decimals],
  );

  const suffix = useMemo((): React.ReactNode => {
    return showMaxButton ? (
      <Button
        disabled={disable}
        type={'ghost'}
        externalTextStyle={{ color: theme.colorSuccess, paddingHorizontal: 0, marginHorizontal: 0 }}
        size={'xs'}
        onPress={_onPressMaxBtn}>
        {i18n.common.max}
      </Button>
    ) : (
      <></>
    );
  }, [_onPressMaxBtn, disable, showMaxButton, theme.colorSuccess]);

  const onChangeInput = useCallback(
    (_rawValue: string) => {
      let _value = _rawValue.replace(/,/g, '.');
      const maxLength = getMaxLengthText(_value);

      if (maxLength && _rawValue.length > maxLength) {
        _value = _value.slice(0, maxLength);
      }
      setInputValue(_value);
      setFirstTime(false);

      const transformVal = getOutputValuesFromString(_value, decimals, defaultInvalidOutputValue);
      onChangeValue(transformVal);
      onSetMax?.(false);
    },
    [decimals, defaultInvalidOutputValue, getMaxLengthText, onChangeValue, onSetMax],
  );

  useEffect(() => {
    let amount = true;
    if (inputValue && !firstTime) {
      const transformVal = getOutputValuesFromString(inputValue || '0', decimals, defaultInvalidOutputValue);
      setTimeout(() => {
        if (amount) {
          onChangeValue(transformVal);
          // inputRef.current?.blur();
        }
      }, 300);
    }

    return () => {
      amount = false;
    };
  }, [decimals, defaultInvalidOutputValue, firstTime, inputRef, inputValue, onChangeValue]);

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
      <View
        style={{
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingTop: !!label ? theme.paddingXS : 0,
        }}>
        {!!label && (
          <Typography.Text
            style={{
              ...FontMedium,
              fontSize: theme.fontSizeSM,
              lineHeight: theme.lineHeightSM * theme.fontSizeSM,
              color: theme.colorTextLight4,
              paddingLeft: theme.sizeSM,
            }}>
            {label}
          </Typography.Text>
        )}
        <View style={[_style.container, disable && DisabledStyle, !!label && { height: 44 }]}>
          <TextInput
            style={[_style.inputTextStyle, externalStyle]}
            autoCorrect={false}
            keyboardType={'decimal-pad'}
            returnKeyType={'done'}
            placeholder={placeholder || i18n.placeholder.amount}
            ref={inputRef}
            onChangeText={onChangeInput}
            defaultValue={inputValue}
            maxLength={getMaxLengthText(inputValue)}
            placeholderTextColor={theme.colorTextLight4}
            editable={!disable}
            textAlign={textAlign}
            value={inputValue}
          />
          {suffix}
        </View>
      </View>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
};

export const InputAmount = forwardRef(Component);
