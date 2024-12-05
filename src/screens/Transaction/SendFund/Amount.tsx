import React, { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/Amount';
import Input, { InputProps } from 'components/design-system-ui/input';
import i18n from 'utils/i18n/i18n';
import { setAdjustResize } from 'rn-android-keyboard-adjust';

export const InvalidAmountValue = '__NAN__';
export const isInvalidAmountValue = (value: string) => {
  return value === InvalidAmountValue;
};

interface InputAmountProps extends Omit<InputProps, 'onChange' | 'onChangeText'> {
  decimals: number;
  onChangeValue: (value: string) => void;
  clearErrors: (name?: string | string[] | readonly string[] | undefined) => void;
  onInputChange?: () => void;
  showMaxButton?: boolean;
  forceUpdateValue?: { value: string | null }; // null means reset
  onSideEffectChange?: () => void; // callback for useEffect that change value
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
    return InvalidAmountValue;
  }

  let valueBigN = new BigN(input);

  valueBigN = valueBigN.times(new BigN(10).pow(power));

  return valueBigN.toFixed().split('.')[0];
};

const Component = (props: InputAmountProps, ref: ForwardedRef<any>) => {
  const theme = useSubWalletTheme().swThemes;

  const {
    decimals,
    onChangeValue,
    onInputChange,
    forceUpdateValue,
    onSideEffectChange,
    value = '',
    inputStyle,
    containerStyle,
    clearErrors,
    ...inputProps
  } = props;
  const stylesheet = createStylesheet(theme);
  const [preservedDecimals, setPreservedDecimals] = useState(decimals);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState(value || '');

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
      if (!_rawValue) {
        setInputValue('');
        clearErrors('value');
        onChangeValue('');

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
        clearErrors('value');
        onChangeValue(transformVal);
      } else {
        clearErrors('value');
        onChangeValue(InvalidAmountValue);
      }
    },
    [clearErrors, decimals, getMaxLengthText, onChangeValue],
  );

  const _onInputChange = useCallback(
    (_value: string) => {
      onChangeInput(_value);
      onInputChange?.();
    },
    [onChangeInput, onInputChange],
  );

  useEffect(() => {
    if (isDirty && preservedDecimals !== decimals) {
      onChangeInput(inputValue);
      setPreservedDecimals(decimals);
      onSideEffectChange?.();
    }
  }, [preservedDecimals, decimals, inputValue, onChangeInput, isDirty, onSideEffectChange]);

  useEffect(() => {
    if (forceUpdateValue) {
      if (forceUpdateValue.value) {
        const transformVal = getInputValuesFromString(forceUpdateValue.value, decimals);

        setIsDirty(true);
        setInputValue(transformVal);
        onChangeValue(forceUpdateValue.value);
        onSideEffectChange?.();
      } else if (forceUpdateValue.value === null) {
        setIsDirty(false);
        setInputValue('');
      }
    }
  }, [decimals, forceUpdateValue, onChangeValue, onSideEffectChange]);

  return (
    <>
      <Input
        ref={ref}
        autoCorrect={false}
        keyboardType={'decimal-pad'}
        returnKeyType={'done'}
        placeholder={inputProps.placeholder || i18n.common.amount}
        onChangeText={_onInputChange}
        defaultValue={inputValue}
        maxLength={getMaxLengthText(inputValue)}
        autoFocus={true}
        {...inputProps}
        inputStyle={[stylesheet.input, inputStyle]}
        containerStyle={[stylesheet.container, containerStyle]}
      />
    </>
  );
};

export const Amount = forwardRef(Component);
