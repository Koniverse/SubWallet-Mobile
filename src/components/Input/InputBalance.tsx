import { FlatList, StyleProp, TextInput, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Text from '../Text';
import React, { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { SiDef } from '@polkadot/util/types';
import { formatBalance } from '@polkadot/util';
import { CaretDown } from 'phosphor-react-native';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { ModalSelectItem } from 'components/ModalSelectItem';
import i18n from 'utils/i18n/i18n';

export interface InputBalanceProps {
  onChange?: (val?: string) => void;
  decimals: number;
  siSymbol: string;
  maxValue?: string;
  placeholder?: string;
  disable?: boolean;
  si: SiDef;
  onChangeSi: (si: SiDef) => void;
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

  return [valueBigN.toFixed().split('.')[0], true];
};

const getInputValuesFromString: (input: string, power: number) => string = (input: string, power: number) => {
  const intValue = input.split('.')[0];
  let valueBigN = new BigN(isValidInput(intValue) ? intValue : '0');
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
  const { onChange, decimals, siSymbol, placeholder, onChangeSi, si, disable } = props;
  const [inputValue, setInputValue] = useState<string>('');
  const [isShowTokenList, setShowTokenList] = useState<boolean>(false);
  const siOptions = useMemo(() => getSiOptions(siSymbol, decimals), [decimals, siSymbol]);

  const maxLengthText = useMemo(() => {
    return inputValue.includes('.') ? decimals + 1 + inputValue.split('.')[0].length : 10;
  }, [decimals, inputValue]);

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

      onChangeSi(curSi);
      onChangeWithSi(inputValue, curSi);
      setShowTokenList(false);
    },
    [onChangeSi, onChangeWithSi, inputValue],
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
        isSelected={!!props.si && si.value === item.value}
        onPress={() => {
          onSelectSiUnit(item.value);
        }}
      />
    );
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TextInput
        autoCorrect={false}
        style={getInputStyle(inputValue, props, si.power)}
        keyboardType={'decimal-pad'}
        defaultValue={inputValue}
        onChangeText={_onChange}
        maxLength={maxLengthText}
        placeholder={placeholder || ''}
        placeholderTextColor={ColorMap.disabled}
        editable={!disable}
      />

      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={() => setShowTokenList(true)}
        disabled={disable}>
        <Text style={getDropdownTextStyle(inputValue)}>{si.text === 'Unit' ? siSymbol : si.text}</Text>
        <CaretDown size={20} weight={'bold'} color={ColorMap.disabled} />
      </TouchableOpacity>

      <SubWalletModal modalVisible={isShowTokenList} onChangeModalVisible={() => setShowTokenList(false)}>
        <View style={unitModalContentWrapper}>
          <Text style={unitModalTitle}>{i18n.title.selectUnit}</Text>
          <FlatList style={{ width: '100%', maxHeight: 500 }} data={siOptions} renderItem={renderItem} />
        </View>
      </SubWalletModal>
    </View>
  );
};

export const InputBalance = forwardRef(Component);
