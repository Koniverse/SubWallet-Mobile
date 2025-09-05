import Number, { SwNumberProps } from 'components/design-system-ui/number';
import BigN from 'bignumber.js';
import BigNumber from 'bignumber.js';
import React, { ReactNode, useCallback, useMemo } from 'react';
import Typography from '../typography';
import { TextStyle, View } from 'react-native';

type Props = SwNumberProps;

interface LocaleNumberFormat {
  decimal: string;
  thousand: string;
}

interface SubscriptTextProps {
  subZeroCount?: number;
  fractionPart?: string;
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

function roundFraction(raw: string, digits: number): string {
  const numStr = `0.${raw}`;
  const rounded = new BigN(numStr).decimalPlaces(digits, BigN.ROUND_HALF_UP);

  return rounded.toFixed(digits).split('.')[1];
}

type DecimalParts = {
  integerPart: string;
  subZeroCount?: number;
  fractionPart?: string;
};

function analyzeDecimal(value: string | number | BigNumber): DecimalParts {
  const str = new BigN(value).toFixed();
  const [intPart, fracRaw = ''] = str.split('.');
  const intVal = +intPart;

  if (!fracRaw || /^0*$/.test(fracRaw)) {
    return { integerPart: intPart };
  }

  if (intVal > 0) {
    if (/^0{3,}$/.test(fracRaw)) {
      return { integerPart: intPart, fractionPart: '000' };
    }

    return {
      integerPart: intPart,
      fractionPart: roundFraction(fracRaw, 4),
    };
  }

  const zeroMatch = fracRaw.match(/^(0{3,})/);
  const subCount = zeroMatch?.[1].length;
  const rest = subCount ? fracRaw.slice(subCount) : fracRaw;
  const maxLen = subCount ? 2 : 4;
  const rounded = roundFraction(rest, maxLen);

  return {
    integerPart: intPart,
    subZeroCount: subCount,
    fractionPart: rounded || (subCount ? '' : undefined),
  };
}

const Component: React.FC<SwNumberProps> = props => {
  // const { getPrefixCls } = useContext(ConfigContext);
  // const [, token] = useToken();
  const {
    size: integerFontSize = 16,
    prefix,
    suffix,
    subFloatNumber,
    subFloatUnit,
    subFloatUnitStyle,
    subFloatUnitFontSize,
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

  // const prefixCls = getPrefixCls('number', customizePrefixCls);
  // const [, hashId] = useStyle(prefixCls);
  //
  // const classNameExtend = useMemo((): string => CN(hashId, className, prefixCls), [hashId, className, prefixCls]);
  const decimalFontSize = useMemo((): number => {
    if (subFloatNumber) {
      return (integerFontSize * 24) / 38;
    }

    return integerFontSize;
  }, [subFloatNumber, integerFontSize]);

  const getSubscriptText = useCallback(
    ({ subZeroCount, fractionPart }: SubscriptTextProps) => {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Typography.Text
            style={{
              ...decimalStyle,
              ...textStyle,
              fontSize: decimalFontSize,
            }}>
            0
          </Typography.Text>
          <Typography.Text style={{ ...decimalStyle, ...textStyle, fontSize: 8, lineHeight: 10 }}>
            {subZeroCount}
          </Typography.Text>
          <Typography.Text
            style={{
              ...decimalStyle,
              ...textStyle,
              fontSize: decimalFontSize,
            }}>
            {fractionPart}
          </Typography.Text>
        </View>
      );
    },
    [decimalFontSize, decimalStyle, textStyle],
  );

  const [_int, _dec] = useMemo((): [string, ReactNode] => {
    const { fractionPart, integerPart, subZeroCount } = analyzeDecimal(value);
    const decPart = (() => {
      if (subZeroCount !== undefined) {
        return <>{getSubscriptText({ fractionPart, subZeroCount })}</>;
      }

      return (
        <Typography.Text
          style={{
            ...decimalStyle,
            ...textStyle,
            fontSize: decimalFontSize,
          }}>
          {fractionPart}
        </Typography.Text>
      );
    })();

    return [intToLocaleString(integerPart, thousandSeparator), decPart];
  }, [decimalFontSize, decimalStyle, getSubscriptText, textStyle, value]);

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end' }, style]}>
      {prefix && (
        <Typography.Text
          style={[
            {
              ...unitStyle,
              ...textStyle,
              fontSize: subFloatUnit ? subFloatUnitFontSize : integerFontSize,
            },
            subFloatUnit && subFloatUnitStyle,
          ]}>
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
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Typography.Text
            style={{
              ...decimalStyle,
              ...textStyle,
              fontSize: decimalFontSize,
            }}>
            {decimalSeparator}
          </Typography.Text>
          <View>{_dec}</View>
        </View>
      )}
      {suffix && (
        <Typography.Text
          style={{
            ...textStyle,
            ...unitStyle,
            fontSize: decimalFontSize,
          }}>
          &nbsp;{suffix}
        </Typography.Text>
      )}
    </View>
  );
};

const NumberDisplay: React.FC<Props> = (props: Props) => {
  const { hide, value } = props;

  const isDefaultComponentUsed = useMemo(() => {
    if (hide) {
      return true;
    }

    return new BigN(value).gte(1) || new BigN(value).lte(-1);
  }, [hide, value]);

  if (isDefaultComponentUsed) {
    return <Number {...props} />;
  }

  return <Component {...props} />;
};

export default NumberDisplay;
