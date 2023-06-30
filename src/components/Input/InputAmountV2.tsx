import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import BigN from 'bignumber.js';
import { Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './style/InputAmount';
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
  maxValue: string;
  onSetMax?: (value: boolean) => void;
  showMaxButton?: boolean;
  forceUpdateMaxValue?: object;
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
    maxValue,
    onChangeValue,
    onSetMax,
    forceUpdateMaxValue,
    showMaxButton = true,
    value = '',
    ...inputProps
  } = props;
  const stylesheet = createStylesheet(theme, showMaxButton);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [preservedDecimals, setPreservedDecimals] = useState(decimals);
  const [inputValue, setInputValue] = useState(value || '');
  const _onClickMaxBtn = useCallback(() => {
    setIsDirty(true);
    const transformVal = getInputValuesFromString(maxValue, decimals);
    setInputValue(transformVal);
    onChangeValue(maxValue);
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
        onChangeValue('');
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

        onChangeValue(transformVal);
      } else {
        onChangeValue(InvalidAmountValue);
      }

      onSetMax?.(false);
    },
    [decimals, getMaxLengthText, onChangeValue, onSetMax],
  );

  const RightPart = useMemo(() => {
    if (!showMaxButton || inputProps.readonly) {
      return undefined;
    }

    return (
      <Button
        disabled={inputProps.disabled}
        type={'ghost'}
        externalTextStyle={stylesheet.buttonText}
        size={'xs'}
        onPress={_onClickMaxBtn}>
        {i18n.common.max}
      </Button>
    );
  }, [_onClickMaxBtn, inputProps.disabled, inputProps.readonly, showMaxButton, stylesheet.buttonText]);

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
      onChangeValue(maxValue);
    }
  }, [decimals, forceUpdateMaxValue, maxValue, onChangeValue]);

  return (
    <>
      <Input
        ref={ref}
        autoCorrect={false}
        keyboardType={'decimal-pad'}
        returnKeyType={'done'}
        placeholder={inputProps.placeholder || i18n.common.amount}
        onChangeText={onChangeInput}
        defaultValue={inputValue}
        maxLength={getMaxLengthText(inputValue)}
        {...inputProps}
        rightPart={RightPart}
        inputStyle={stylesheet.input}
      />
    </>
  );
};

export const InputAmount = forwardRef(Component);
