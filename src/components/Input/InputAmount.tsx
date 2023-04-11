import React, { ForwardedRef, forwardRef, useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import BigN from 'bignumber.js';
import { Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';

interface InputAmountProps {
  placeholder?: string;
  decimals: number;
  value: string;
  onChangeValue: (value: string) => void;
  maxValue: string;
  disable?: boolean;
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
  const { decimals, disable, placeholder, maxValue, onChangeValue, value } = props;
  const [inputValue, setInputValue] = useState(value);
  const _onClickMaxBtn = useCallback(() => {
    const transformVal = getInputValuesFromString(maxValue, decimals);
    setInputValue(transformVal);
    onChangeValue(transformVal);
  }, [decimals, maxValue, onChangeValue]);

  const getMaxLengthText = useCallback(
    (_value: string) => {
      return _value.includes('.') ? decimals + 1 + _value.split('.')[0].length : 10;
    },
    [decimals],
  );

  const onChangeInput = useCallback(
    (_value: string) => {
      let currentValue = '';
      const maxLength = getMaxLengthText(_value);

      if (_value.length > maxLength) {
        currentValue = value.slice(0, maxLength);
      }

      setInputValue(currentValue);

      const transformVal = getOutputValuesFromString(currentValue, decimals);
      onChangeValue(transformVal);
    },
    [decimals, getMaxLengthText, onChangeValue, value],
  );

  return (
    <View
      style={{
        backgroundColor: theme.colorBgSecondary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingLeft: 16,
        paddingRight: 4,
        borderRadius: 5,
      }}>
      <TextInput
        style={{
          padding: 0,
          textAlignVertical: 'top',
          fontSize: theme.fontSize,
          ...FontMedium,
          color: theme.colorTextTertiary,
          flex: 1,
        }}
        autoCorrect={false}
        keyboardType={'decimal-pad'}
        placeholder={placeholder || 'Amount'}
        ref={ref}
        onChangeText={onChangeInput}
        defaultValue={inputValue}
        maxLength={getMaxLengthText(inputValue)}
        placeholderTextColor={theme.colorTextTertiary}
        editable={disable}
      />
      <Button type={'ghost'} externalTextStyle={{ color: theme.colorSuccess }} size={'xs'} onPress={_onClickMaxBtn}>
        {'Max'}
      </Button>
    </View>
  );
};

export const InputAmount = forwardRef(Component);
