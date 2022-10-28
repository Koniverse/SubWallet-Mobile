import { TextInput, View } from 'react-native';
import { ColorMap } from 'styles/color';
import React, { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { SiDef } from '@polkadot/util/types';

export interface InputBalanceProps {
  onChange?: (val?: string) => void;
  decimals: number;
  maxValue?: string;
  placeholder?: string;
  disable?: boolean;
  si: SiDef;
  value: string;
}

const isValidInput = (input: string) => {
  return !(isNaN(parseFloat(input)) || !input.match(/^-?\d*(\.\d+)?$/));
};

const getBaseTextStyle = (inputValue: string) => {
  const initStyle = {
    ...sharedStyles.largeText,
    ...FontBold,
  };

  if (inputValue.length > 15) {
    return {
      ...initStyle,
      fontSize: 28,
      lineHeight: 38,
    };
  } else if (inputValue.length > 11) {
    return {
      ...initStyle,
      fontSize: 34,
      lineHeight: 46,
    };
  }

  return {
    ...initStyle,
  };
};

const getOutputValuesFromString: (input: string, power: number) => [string, boolean] = (
  input: string,
  power: number,
) => {
  if (!isValidInput(input)) {
    return ['', false];
  }

  let valueBigN = new BigN(input);
  valueBigN = valueBigN.times(new BigN(10).pow(power));

  return [valueBigN.toFixed(), true];
};

const getInputValuesFromString: (input: string, power: number) => string = (input: string, power: number) => {
  let valueBigN = new BigN(isValidInput(input) ? input : '0');
  valueBigN = valueBigN.div(new BigN(10).pow(power));
  return valueBigN.toFixed();
};

const getInputStyle = (inputValue: string, props: InputBalanceProps, siPower: number) => {
  const baseStyle = getBaseTextStyle(inputValue);
  const { maxValue, decimals } = props;
  const [outputValue, _isValidInput] = getOutputValuesFromString(inputValue, decimals + siPower);
  let isValid = _isValidInput;

  if (_isValidInput && maxValue && isValidInput(maxValue)) {
    isValid = _isValidInput && new BigN(outputValue).lte(new BigN(maxValue));
  }

  return {
    ...baseStyle,
    color: isValid ? ColorMap.light : ColorMap.danger,
  };
};

const Component = (props: InputBalanceProps, ref: ForwardedRef<any>) => {
  const { onChange, decimals, placeholder, si, disable, value } = props;
  const [inputValue, setInputValue] = useState<string>(value);

  const onChangeWithSi = useCallback(
    (input: string, curSi: SiDef) => {
      setInputValue(input.replace(',', '.'));

      if (onChange) {
        const [outputValue, isValid] = getOutputValuesFromString(input, decimals + curSi.power);
        onChange(isValid ? outputValue : undefined);
      }
    },
    [decimals, onChange],
  );

  const _onChange = (input: string) => {
    onChangeWithSi(input, si);
  };

  useImperativeHandle(ref, () => ({
    onChange: (input?: string) => {
      if (!input) {
        return;
      }

      const _inputValue = getInputValuesFromString(input, decimals + si.power);
      _onChange(_inputValue);
    },
  }));

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TextInput
        autoCorrect={false}
        autoFocus={true}
        style={getInputStyle(inputValue, props, si.power)}
        keyboardType={'decimal-pad'}
        defaultValue={inputValue}
        onChangeText={_onChange}
        maxLength={inputValue.includes('.') ? decimals + 2 : 18}
        placeholder={placeholder || ''}
        placeholderTextColor={ColorMap.disabled}
        editable={!disable}
      />
    </View>
  );
};

export const InputBalance = forwardRef(Component);
