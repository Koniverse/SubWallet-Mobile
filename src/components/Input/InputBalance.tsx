import { TextInput, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Text from '../Text';
import React, { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { SiDef } from '@polkadot/util/types';
import { TokenSelect } from 'screens/TokenSelect';
import { IconProps } from 'phosphor-react-native';
import { TokenItemType } from 'types/ui-types';

export interface InputBalanceProps {
  onChange?: (val?: string) => void;
  decimals: number;
  siSymbol: string;
  maxValue?: string;
  placeholder?: string;
  disable?: boolean;
  si: SiDef;
  senderAddress: string;
  icon: (iconProps: IconProps) => JSX.Element;
  value: string;
  onChangeToken: (tokenValueStr: string) => void;
  selectedToken: string;
  selectedNetworkKey: string;
  filteredNetworkKey?: string;
  externalTokenOptions?: TokenItemType[];
}

const isValidInput = (input: string) => {
  return !(isNaN(parseFloat(input)) || !input.match(/^-?\d*(\.\d+)?$/));
};

const getBaseTextStyle = (inputValue: string) => {
  const initStyle = {
    ...sharedStyles.largeText,
    ...FontBold,
  };

  if (inputValue.length > 18) {
    return {
      ...initStyle,
      ...FontSize1,
      lineHeight: 18,
    };
  } else if (inputValue.length > 13) {
    return {
      ...initStyle,
      ...FontSize3,
      lineHeight: 23,
    };
  } else if (inputValue.length > 10) {
    return {
      ...initStyle,
      fontSize: 24,
      lineHeight: 30,
    };
  } else if (inputValue.length > 7) {
    return {
      ...initStyle,
      fontSize: 30,
      lineHeight: 38,
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
    paddingRight: 10,
    minWidth: 40,
  };
};

const getDropdownTextStyle = (inputValue: string) => {
  const baseStyle = getBaseTextStyle(inputValue);

  return {
    ...baseStyle,
    color: ColorMap.light,
    paddingRight: 4,
  };
};

const Component = (props: InputBalanceProps, ref: ForwardedRef<any>) => {
  const {
    onChange,
    decimals,
    siSymbol,
    placeholder,
    si,
    disable,
    senderAddress,
    icon: Icon,
    value,
    onChangeToken,
    selectedToken,
    selectedNetworkKey,
    filteredNetworkKey,
    externalTokenOptions,
  } = props;
  const [inputValue, setInputValue] = useState<string>(value);
  const [isShowTokenList, setShowTokenList] = useState<boolean>(false);

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

  const _onChangeToken = (item: TokenItemType) => {
    onChangeToken(item.symbol);
    setShowTokenList(false);
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TextInput
        autoCorrect={false}
        style={getInputStyle(inputValue, props, si.power)}
        keyboardType={'decimal-pad'}
        defaultValue={inputValue}
        onChangeText={_onChange}
        maxLength={inputValue.includes('.') ? decimals + 2 : 10}
        placeholder={placeholder || ''}
        placeholderTextColor={ColorMap.disabled}
        editable={!disable}
      />

      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={() => setShowTokenList(true)}
        disabled={disable}>
        <Text style={getDropdownTextStyle(inputValue)}>{siSymbol}</Text>
        <Icon size={20} color={ColorMap.disabled} weight={'bold'} />
      </TouchableOpacity>

      <TokenSelect
        filteredNetworkKey={filteredNetworkKey}
        selectedToken={selectedToken}
        selectedNetworkKey={selectedNetworkKey}
        onChangeToken={_onChangeToken}
        onPressBack={() => setShowTokenList(false)}
        address={senderAddress}
        modalVisible={isShowTokenList}
        onChangeModalVisible={() => setShowTokenList(false)}
        externalTokenOptions={externalTokenOptions}
      />
    </View>
  );
};

export const InputBalance = forwardRef(Component);
