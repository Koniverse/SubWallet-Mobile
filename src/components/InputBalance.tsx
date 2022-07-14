import { FlatList, StyleProp, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import React, { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { SiDef } from '@polkadot/util/types';
import { formatBalance } from '@polkadot/util';
import { CaretDown } from 'phosphor-react-native';
import { SubWalletModal } from 'components/SubWalletModal';
import { ModalSelectItem } from 'components/ModalSelectItem';

export interface InputBalanceProps {
  onChange?: (val?: string) => void;
  decimals: number;
  siSymbol: string;
  maxValue?: string;
  placeholder?: string;
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

const unitModalContentWrapper: StyleProp<any> = {
  alignItems: 'center',
  width: '100%',
  flex: 1,
  paddingBottom: 42,
};

const unitModalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
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

function getSiOptions(symbol: string, decimals?: number): { text: string; value: string }[] {
  return formatBalance.getOptions(decimals).map(({ power, text, value }): { text: string; value: string } => ({
    text: power === 0 ? symbol : text,
    value,
  }));
}

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
  };
};

const getDropdownTextStyle = (inputValue: string) => {
  const baseStyle = getBaseTextStyle(inputValue);

  return {
    ...baseStyle,
    color: ColorMap.disabled,
    paddingRight: 4,
  };
};

const Component = (props: InputBalanceProps, ref: ForwardedRef<any>) => {
  const { onChange, decimals, siSymbol, placeholder } = props;
  const [inputValue, setInputValue] = useState<string>('');
  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [isShowTokenList, setShowTokenList] = useState<boolean>(false);
  const siOptions = useMemo(() => getSiOptions(siSymbol, decimals), [decimals, siSymbol]);

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

  const onSelectSiUnit = useCallback(
    (siUnit: string): void => {
      const curSi = formatBalance.findSi(siUnit);

      setSi(curSi);
      onChangeWithSi(inputValue, curSi);
      setShowTokenList(false);
    },
    [onChangeWithSi, inputValue],
  );

  useImperativeHandle(ref, () => ({
    onChange: (input?: string) => {
      if (!input) {
        return;
      }

      const _inputValue = getInputValuesFromString(input, decimals + si.power);
      _onChange(_inputValue);
    },
  }));

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <ModalSelectItem
        key={item.value}
        label={item.text}
        isSelected={!!si && si.value === item.value}
        onPress={() => {
          onSelectSiUnit(item.value);
        }}
      />
    );
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TextInput
        style={getInputStyle(inputValue, props, si.power)}
        keyboardType={'decimal-pad'}
        defaultValue={inputValue}
        onChangeText={_onChange}
        maxLength={18}
        placeholder={placeholder || ''}
        placeholderTextColor={ColorMap.disabled}
      />

      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setShowTokenList(true)}>
        <Text style={getDropdownTextStyle(inputValue)}>{si.text === 'Unit' ? siSymbol : si.text}</Text>
        <CaretDown size={20} weight={'bold'} color={ColorMap.disabled} />
      </TouchableOpacity>

      <SubWalletModal
        modalVisible={isShowTokenList}
        onChangeModalVisible={() => setShowTokenList(false)}
        modalStyle={{ height: 494 }}>
        <View style={unitModalContentWrapper}>
          <Text style={unitModalTitle}>Unit Selection</Text>
          <FlatList style={{ width: '100%' }} data={siOptions} renderItem={renderItem} />
        </View>
      </SubWalletModal>
    </View>
  );
};

export const InputBalance = forwardRef(Component);
