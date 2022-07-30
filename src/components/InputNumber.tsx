import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleProp, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';
import { SubWalletModal } from 'components/SubWalletModal';
import { ModalSelectItem } from 'components/ModalSelectItem';
import type { SiDef } from '@polkadot/util/types';
import { BitLengthOption } from '../constant';
import { BN, BN_ONE, BN_TEN, BN_TWO, BN_ZERO, formatBalance, isBn } from '@polkadot/util';
import { BitLength } from 'types/ui-types';

interface Props {
  siSymbol?: string;
  decimals: number;
  bitLength?: BitLength;
  defaultValue?: string | BN;
  isZeroable?: boolean;
  onChangeText?: (value?: BN) => void;
  isSi?: boolean;
  maxValue?: BN;
  value?: BN | null | string;
  siDefault?: SiDef;
  isDisabled?: boolean;
  placeholder?: string;
}

const DEFAULT_BITLENGTH = BitLengthOption.NORMAL_NUMBERS as BitLength;

const DEFAULT_TOKEN_UNIT = 'Unit';

function getGlobalMaxValue(bitLength?: number): BN {
  return BN_TWO.pow(new BN(bitLength || DEFAULT_BITLENGTH)).isub(BN_ONE);
}

function getRegex(isDecimal: boolean): RegExp {
  const decimal = '.';

  return new RegExp(isDecimal ? `^(0|[1-9]\\d*)(\\${decimal}\\d*)?$` : '^(0|[1-9]\\d*)$');
}

function getSiOptions(symbol: string, decimals?: number): { text: string; value: string }[] {
  return formatBalance.getOptions(decimals).map(({ power, text, value }): { text: string; value: string } => ({
    text: power === 0 ? symbol : text,
    value,
  }));
}

function getSiPowers(si: SiDef | null, decimals: number): [BN, number, number] {
  if (!si) {
    return [BN_ZERO, 0, 0];
  }

  const basePower = decimals;

  return [new BN(basePower + si.power), basePower, si.power];
}

function isValidNumber(bn: BN, bitLength: BitLength, isZeroable: boolean, maxValue?: BN): boolean {
  if (
    // cannot be negative
    bn.lt(BN_ZERO) ||
    // cannot be > than allowed max
    bn.gt(getGlobalMaxValue(bitLength)) ||
    // check if 0 and it should be a value
    (!isZeroable && bn.isZero()) ||
    // check that the bitlengths fit
    bn.bitLength() > (bitLength || DEFAULT_BITLENGTH) ||
    // cannot be > max (if specified)
    (maxValue && maxValue.gtn(0) && bn.gt(maxValue))
  ) {
    return false;
  }

  return true;
}

function inputToBn(
  input: string,
  si: SiDef | null,
  bitLength: BitLength,
  isZeroable: boolean,
  decimals: number,
  maxValue?: BN,
): [BN, boolean] {
  const [siPower, basePower, siUnitPower] = getSiPowers(si, decimals);

  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);

  let result;

  if (isDecimalValue) {
    if (siUnitPower - isDecimalValue[2].length < -basePower) {
      result = new BN(-1);
    }

    const div = new BN(input.replace(/\.\d*$/, ''));
    const modString = input.replace(/^\d+\./, '').substr(0, decimals);
    const mod = new BN(modString);

    result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))));
  } else {
    result = new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(siPower));
  }

  return [result, input === '' ? false : isValidNumber(result, bitLength, isZeroable, maxValue)];
}

function addCommas(x: string) {
  const parts = x.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

function getValuesFromString(
  value: string,
  si: SiDef | null,
  bitLength: BitLength,
  isZeroable: boolean,
  decimals: number,
  maxValue?: BN,
): [string, BN, boolean] {
  const [valueBn, isValid] = inputToBn(value, si, bitLength, isZeroable, decimals, maxValue);

  return [value, valueBn, isValid];
}

function getFormattedValuesFromString(
  isAddComma: boolean,
  value: string,
  si: SiDef | null,
  bitLength: BitLength,
  isZeroable: boolean,
  decimals: number,
  maxValue?: BN,
): [string, BN, boolean] {
  const [valueBn, isValid] = inputToBn(value, si, bitLength, isZeroable, decimals, maxValue);
  let formattedValue;

  if (isAddComma) {
    formattedValue = addCommas(value);
  } else {
    formattedValue = value.replace(/,/g, '');
  }

  return [formattedValue, valueBn, isValid];
}

export function getValuesFromBn(
  valueBn: BN,
  si: SiDef | null,
  isZeroable: boolean,
  decimals: number,
): [string, BN, boolean] {
  const value = si ? valueBn.div(BN_TEN.pow(new BN(decimals + si.power))).toString() : valueBn.toString();

  return [value, valueBn, isZeroable ? true : valueBn.gt(BN_ZERO)];
}

function getValues(
  value: BN | string = '',
  si: SiDef | null,
  bitLength: BitLength,
  isZeroable: boolean,
  decimals: number,
  maxValue?: BN,
): [string, BN, boolean] {
  return isBn(value)
    ? getValuesFromBn(value, si, isZeroable, decimals)
    : getValuesFromString(value, si, bitLength, isZeroable, decimals, maxValue);
}

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

export const InputNumber = ({
  siSymbol,
  decimals,
  defaultValue,
  onChangeText,
  isSi = true,
  isDisabled,
  siDefault,
  isZeroable = true,
  maxValue,
  bitLength = DEFAULT_BITLENGTH,
  value: propsValue,
  placeholder,
}: Props) => {
  const [isShowTokenList, setShowTokenList] = useState<boolean>(false);
  const siOptions = useMemo(
    () => getSiOptions(siSymbol || DEFAULT_TOKEN_UNIT, decimals),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [decimals, siSymbol],
  );
  const [si, setSi] = useState<SiDef | null>(() => (isSi ? siDefault || formatBalance.findSi('-') : null));
  const [[value, valueBn, isValid], setValues] = useState<[string, BN, boolean]>(() =>
    getValues(propsValue || defaultValue, si, bitLength, isZeroable, decimals, maxValue),
  );

  useEffect(() => {
    onChangeText && onChangeText(isValid ? valueBn : undefined);
    let isSync = true;

    if (isSync) {
      const newValues: [string, BN, boolean] = getFormattedValuesFromString(
        false,
        value,
        si,
        bitLength,
        isZeroable,
        decimals,
        maxValue,
      );

      if (newValues[1].toString() === valueBn.toString()) {
        onChangeText && onChangeText(isValid ? valueBn : undefined);
      } else {
        setValues(newValues);
      }
    }

    return () => {
      isSync = false;
    };
  }, [isValid, valueBn, decimals, bitLength, isZeroable, maxValue, si, value, onChangeText]);

  const _onChangeWithSi = useCallback(
    (input: string, curSi: SiDef | null) => {
      setValues(getValuesFromString(input, curSi, bitLength, isZeroable, decimals, maxValue));
    },
    [bitLength, isZeroable, maxValue, decimals],
  );

  const _onChange = useCallback((input: string) => _onChangeWithSi(input, si), [_onChangeWithSi, si]);

  const _onBlur = useCallback(() => {
    setValues(getFormattedValuesFromString(true, value, si, bitLength, isZeroable, decimals, maxValue));
  }, [bitLength, isZeroable, maxValue, si, decimals, value]);

  const _onFocus = useCallback(() => {
    setValues(getFormattedValuesFromString(false, value, si, bitLength, isZeroable, decimals, maxValue));
  }, [bitLength, isZeroable, maxValue, si, decimals, value]);

  useEffect((): void => {
    defaultValue && _onChange(defaultValue.toString());
  }, [_onChange, defaultValue]);

  const getInputStyle = (inputValue: string, color: string, paddingRight: number) => {
    const initStyle = {
      ...sharedStyles.largeText,
      color: color,
      ...FontBold,
      paddingRight: paddingRight,
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

  const _onSelectSiUnit = useCallback(
    (siUnit: string): void => {
      const curSi = formatBalance.findSi(siUnit);

      setSi(curSi);
      _onChangeWithSi(value, curSi);
      setShowTokenList(false);
    },
    [_onChangeWithSi, value],
  );

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <ModalSelectItem
        key={item.value}
        label={item.text}
        isSelected={!!si && si.value === item.value}
        onPress={() => {
          _onSelectSiUnit(item.value);
        }}
      />
    );
  };

  let iconSize = 20;
  if (value.length > 18) {
    iconSize = 12;
  } else if (value.length > 13) {
    iconSize = 15;
  } else if (value.length > 10) {
    iconSize = 18;
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TextInput
        autoCorrect={false}
        style={getInputStyle(value, ColorMap.light, 10)}
        keyboardType={'decimal-pad'}
        defaultValue={value}
        onChangeText={_onChange}
        maxLength={18}
        autoFocus
        placeholder={placeholder}
        placeholderTextColor={ColorMap.disabled}
        onBlur={_onBlur}
        onFocus={_onFocus}
      />

      {!!si && (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setShowTokenList(true)}>
          <Text style={getInputStyle(value, ColorMap.disabled, 4)}>
            {isDisabled && siDefault ? siDefault.text : si.text === 'Unit' ? siSymbol : si.text}
          </Text>
          <CaretDown size={iconSize} weight={'bold'} color={ColorMap.disabled} />
        </TouchableOpacity>
      )}

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
