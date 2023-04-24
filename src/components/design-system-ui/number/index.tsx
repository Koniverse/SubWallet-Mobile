// @ts-nocheck
import type { NumberFormatter } from 'utils/number';
import { balanceFormatter, formatNumber } from 'utils/number';
import type { BigNumber } from 'bignumber.js';
import React, { useMemo } from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';
import { Typography } from '..';

export interface SwNumberProps {
  value: string | number | BigNumber;
  decimal: number;
  size?: number;
  textStyle?: TextStyle;
  subFloatNumber?: boolean;
  prefix?: string;
  suffix?: string;
  formatType?: 'default' | 'balance' | 'custom';
  customFormatter?: NumberFormatter;
  metadata?: Record<string, number>;
  intOpacity?: number;
  intColor?: string;
  decimalOpacity?: number;
  decimalColor?: string;
  unitOpacity?: number;
  unitColor?: string;
  style?: ViewStyle;
}

interface LocaleNumberFormat {
  decimal: string;
  thousand: string;
}

const intToLocaleString = (str: string, separator: string) => str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const getNumberSeparators = () => {
  // default
  const res: LocaleNumberFormat = {
    decimal: '.',
    thousand: '',
  };

  // convert a number formatted according to locale
  const str = parseFloat('1234.56').toLocaleString();

  // if the resulting number does not contain previous number
  // (i.e. in some Arabic formats), return defaults
  if (!str.match('1')) {
    return res;
  }

  // get decimal and thousand separators
  res.decimal = str.replace(/.*4(.*)5.*/, '$1');
  res.thousand = str.replace(/.*1(.*)2.*/, '$1');

  // return results
  return res;
};

const { decimal: decimalSeparator, thousand: thousandSeparator } = getNumberSeparators();

const Number: React.FC<SwNumberProps> = props => {
  const {
    metadata,
    formatType,
    decimal,
    size: integerFontSize = 16,
    prefix,
    customFormatter,
    suffix,
    subFloatNumber,
    value,
    intColor = '#fff',
    intOpacity = 1,
    decimalColor = '#fff',
    decimalOpacity = 1,
    unitColor = '#fff',
    unitOpacity = 1,
    textStyle = {},
    style,
  } = props;

  const intStyle = useMemo(
    (): TextStyle => ({
      color: intColor,
      opacity: intOpacity,
    }),
    [intColor, intOpacity],
  );

  const decimalStyle = useMemo(
    (): TextStyle => ({
      color: decimalColor,
      opacity: decimalOpacity,
    }),
    [decimalColor, decimalOpacity],
  );

  const unitStyle = useMemo(
    (): TextStyle => ({
      color: unitColor,
      opacity: unitOpacity,
    }),
    [unitColor, unitOpacity],
  );

  const decimalFontSize = useMemo((): number => {
    if (subFloatNumber) {
      return (integerFontSize * 24) / 38;
    }

    return integerFontSize;
  }, [subFloatNumber, integerFontSize]);

  const formatted = useMemo((): string => {
    try {
      switch (formatType) {
        case 'custom':
          if (customFormatter) {
            return formatNumber(value, decimal, customFormatter, metadata);
          }
          return formatNumber(value, decimal, balanceFormatter, metadata);
        case 'balance':
        case 'default':
        default:
          return formatNumber(value, decimal, balanceFormatter, metadata);
      }
    } catch (e) {
      return value.toString();
    }
  }, [value, decimal, customFormatter, formatType, metadata]);

  const [_int, _dec, _abbreviation] = useMemo((): [string, string, string] => {
    const [int, decAndAbb] = formatted.split('.');
    const [dec, abbreviation] = decAndAbb ? decAndAbb.split(' ') : [''];

    return [intToLocaleString(int, thousandSeparator), dec, abbreviation];
  }, [formatted]);

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline' }, style]}>
      {prefix && (
        <Typography.Text
          style={{
            ...unitStyle,
            ...textStyle,
            fontSize: integerFontSize,
          }}>
          {prefix}
        </Typography.Text>
      )}
      <Typography.Text
        style={{
          ...intStyle,
          ...textStyle,
          fontSize: integerFontSize,
        }}>
        {_int}
      </Typography.Text>
      {!!_dec && (
        <Typography.Text
          style={{
            ...decimalStyle,
            ...textStyle,
            fontSize: decimalFontSize,
          }}>
          {decimalSeparator}
          {_dec}
        </Typography.Text>
      )}
      {!!_abbreviation && (
        <Typography.Text
          style={{
            ...intStyle,
            ...textStyle,
            fontSize: integerFontSize,
          }}>
          {` ${_abbreviation}`}
        </Typography.Text>
      )}
      {suffix && (
        <Typography.Text
          style={{
            ...unitStyle,
            ...textStyle,
            fontSize: decimalFontSize,
          }}>
          &nbsp;{suffix}
        </Typography.Text>
      )}
    </View>
  );
};

export default Number;
