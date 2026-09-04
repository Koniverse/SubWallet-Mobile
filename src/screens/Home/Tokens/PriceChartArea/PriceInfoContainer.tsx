import React, { useMemo } from 'react';
import BigN from 'bignumber.js';
import { PriceChartPoint } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO } from 'utils/chainBalances';
import { PriceInfoUI } from './PriceInfoUI';
import { PriceInfoUIProps } from './types';

interface Props {
  pricePoints: PriceChartPoint[];
  hoverPricePointIndex: number | null;
  /** Current price to show until the history lands, so the header is never $0. */
  fallbackValue?: number;
  /** Opening price for the fallback, known for 24h only. */
  fallbackFirst?: number;
}

function buildPriceInfo(value: BigN, first: BigN): PriceInfoUIProps {
  const diff = value.minus(first);

  return {
    value,
    change: diff.abs(),
    percent: first.isZero() ? BN_ZERO : diff.abs().dividedBy(first).multipliedBy(100),
    ...(diff.isLessThan(0) && { isPriceDown: true }),
  };
}

export const PriceInfoContainer = ({ fallbackFirst, fallbackValue, hoverPricePointIndex, pricePoints }: Props) => {
  const priceInfoUIProps = useMemo<PriceInfoUIProps>(() => {
    const index = pricePoints.length ? hoverPricePointIndex ?? pricePoints.length - 1 : -1;
    const target = index >= 0 ? pricePoints[index] : undefined;

    if (!target) {
      if (fallbackValue === undefined) {
        return { value: BN_ZERO, change: BN_ZERO, percent: BN_ZERO, isChangeUnknown: true };
      }

      const value = new BigN(fallbackValue);

      if (!fallbackFirst) {
        return { value, change: BN_ZERO, percent: BN_ZERO, isChangeUnknown: true };
      }

      return buildPriceInfo(value, new BigN(fallbackFirst));
    }

    return buildPriceInfo(new BigN(target.value), new BigN(pricePoints[0].value));
  }, [fallbackFirst, fallbackValue, hoverPricePointIndex, pricePoints]);

  return <PriceInfoUI {...priceInfoUIProps} />;
};
