// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import React from 'react';

import { BN, BN_ZERO, formatBalance } from '@polkadot/util';
import { BalanceFormatType } from 'types/ui-types';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getTokenDisplayName } from 'utils/chainBalances';

interface Props {
  children?: React.ReactNode;
  style?: object;
  format: BalanceFormatType; // decimals | symbol | symbol Alt
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: LabelPost;
  value?: Compact<any> | BN | string | null | 'all';
  withCurrency?: boolean;
  withSi?: boolean;
  valueColor?: string;
}

const formatBalanceFrontPartStyle: StyleProp<any> = {};
const formatBalancePostfixStyle: StyleProp<any> = {};
const formatBalanceUnit: StyleProp<any> = {};
const formatBalanceStyle: StyleProp<any> = {};
function getFormatBalanceValueStyle(color: string): StyleProp<any> {
  return {
    color: color,
    ...sharedStyles.mainText,
    ...FontMedium,
  };
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

type LabelPost = string | React.ReactNode;

function createElement(
  prefix: string,
  postfix: string,
  unit: string,
  label: LabelPost = '',
  isShort = false,
): React.ReactNode {
  return (
    <>
      <Text style={formatBalanceFrontPartStyle}>
        {`${prefix}${isShort ? '' : '.'}`}
        {!isShort && <Text style={formatBalancePostfixStyle}>{`0000${postfix || ''}`.slice(-4)}</Text>}
      </Text>
      <Text style={formatBalanceUnit}> {unit}</Text>
      <Text>{label}</Text>
    </>
  );
}

function applyFormat(
  value: Compact<any> | BN | string,
  [decimals, symbol, symbolAlt]: BalanceFormatType,
  withCurrency = true,
  withSi?: boolean,
  _isShort?: boolean,
  labelPost?: LabelPost,
): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? getTokenDisplayName(symbol, symbolAlt) : '';

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.');
    const minor = rest.substr(0, 4);
    const unit = rest.substr(4);

    return (
      <>
        <Text style={formatBalanceFrontPartStyle}>
          {major}.<Text style={formatBalancePostfixStyle}>{minor}</Text>
        </Text>
        <Text style={formatBalanceUnit}>
          {unit}
          {unit ? unitPost : ` ${unitPost}`}
        </Text>
        {labelPost || ''}11
      </>
    );
  }

  return createElement(prefix, postfix, unitPost, labelPost, isShort);
}

function FormatBalance({
  children,
  style,
  format,
  isShort,
  label,
  labelPost,
  value,
  withCurrency,
  withSi,
  valueColor,
}: Props): React.ReactElement<Props> {
  return (
    <View style={[formatBalanceStyle, style]}>
      {label && <Text>{<Text>{label}&nbsp;</Text>}</Text>}
      <Text style={getFormatBalanceValueStyle(valueColor || ColorMap.light)}>
        {value
          ? applyFormat(value, format, withCurrency, withSi, isShort, labelPost)
          : applyFormat(BN_ZERO, format, withCurrency, withSi, isShort, labelPost)}
      </Text>
      {children}
    </View>
  );
}

export default FormatBalance;
