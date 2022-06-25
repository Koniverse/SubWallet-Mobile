import React, { useMemo } from 'react';
import { BN, formatBalance, isUndefined } from '@polkadot/util';
import { SiDef } from '@polkadot/util/types';
import { InputNumber } from 'components/InputNumber';
import {BitLengthOption} from "../constant";
import {BitLength} from "types/ui-types";

interface Props {
  defaultValue?: BN | string;
  decimals: number;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isWarning?: boolean;
  isZeroable?: boolean;
  label?: React.ReactNode;
  maxValue?: BN;
  onChangeText?: (value?: BN) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  placeholder?: string;
  siDecimals?: number;
  siSymbol?: string;
  value?: BN;
}

const DEFAULT_BITLENGTH = BitLengthOption.CHAIN_SPEC as BitLength;

function reformat(value?: string | BN, isDisabled?: boolean, siDecimals?: number): [string?, SiDef?] {
  if (!value) {
    return [];
  }

  const decimals = isUndefined(siDecimals) ? formatBalance.getDefaults().decimals : siDecimals;
  const si = isDisabled ? formatBalance.calcSi(value.toString(), decimals) : formatBalance.findSi('-');

  return [
    formatBalance(value, { decimals, forceUnit: si.value, withSi: false }).replace(/,/g, isDisabled ? ',' : ''),
    si,
  ];
}

export const InputBalance = ({
  onChangeText,
  decimals,
  defaultValue: inDefault,
  isDisabled,
  isZeroable,
  maxValue,
  placeholder,
  siSymbol,
  value,
  siDecimals,
}: Props) => {
  const [defaultValue, siDefault] = useMemo(
    () => reformat(inDefault, isDisabled, siDecimals),
    [inDefault, isDisabled, siDecimals],
  );

  console.log('defaultValue', defaultValue);

  return (
    <InputNumber
      onChangeText={onChangeText}
      decimals={decimals}
      bitLength={DEFAULT_BITLENGTH}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      isSi
      isZeroable={isZeroable}
      maxValue={maxValue}
      placeholder={placeholder}
      siDefault={siDefault}
      siSymbol={siSymbol}
      value={value}
    />
  );
};
