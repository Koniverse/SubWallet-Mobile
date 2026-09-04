import React, { useMemo } from 'react';
import BigN from 'bignumber.js';
import { PriceChartPoint } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO } from 'utils/chainBalances';
import { PriceInfoUI } from './PriceInfoUI';
import { PriceInfoUIProps } from './types';

interface Props {
  pricePoints: PriceChartPoint[];
  hoverPricePointIndex: number | null;
}

export const PriceInfoContainer = ({ hoverPricePointIndex, pricePoints }: Props) => {
  const priceInfoUIProps = useMemo<PriceInfoUIProps>(() => {
    if (!pricePoints.length) {
      return { value: BN_ZERO, change: BN_ZERO, percent: BN_ZERO };
    }

    const first = new BigN(pricePoints[0].value);
    const index = hoverPricePointIndex ?? pricePoints.length - 1;
    const target = pricePoints[index];

    if (!target) {
      return { value: BN_ZERO, change: BN_ZERO, percent: BN_ZERO };
    }

    const value = new BigN(target.value);
    const diff = value.minus(first);

    return {
      value,
      change: diff.abs(),
      percent: first.isZero() ? BN_ZERO : diff.abs().dividedBy(first).multipliedBy(100),
      ...(diff.isLessThan(0) && { isPriceDown: true }),
    };
  }, [hoverPricePointIndex, pricePoints]);

  return <PriceInfoUI {...priceInfoUIProps} />;
};
