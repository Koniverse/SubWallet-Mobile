import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CurrentTokenPrice, PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { cancelSubscription, getHistoryTokenPrice, subscribeCurrentTokenPrice } from 'messaging/index';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { PriceChart } from './PriceChart';
import { PriceInfoContainer } from './PriceInfoContainer';
import { PriceInfoUI } from './PriceInfoUI';
import { TimeframeSelector } from './TimeframeSelector';
import { timeframeIntervals } from './shared';

interface Props {
  priceId?: string;
  isChartSupported?: boolean;
}

interface ComponentProps {
  priceId: string;
}

// Re-fetching the same timeframe more often than this adds nothing: the backend
// buckets history and the live subscription already covers the latest point.
const HISTORY_REFETCH_INTERVAL = 30000;

const Component = ({ priceId }: ComponentProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<PriceChartTimeframe>('1D');
  const currency = useSelector((state: RootState) => state.price.currency);
  const [rawPricePoints, setRawPricePoints] = useState<PriceChartPoint[]>([]);
  const [hoverPricePointIndex, setHoverPricePointIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<CurrentTokenPrice | null>(null);
  const lastFetchPriceHistoryTimeRef = useRef<Record<string, number>>({});
  const prevCurrencyRef = useRef(currency);
  const priceHistoryCacheRef = useRef<Record<string, PriceChartPoint[]>>({});

  const interval = timeframeIntervals[selectedTimeframe];

  const mergedRawPricePoints = useMemo<PriceChartPoint[]>(() => {
    if (!livePrice || !rawPricePoints.length) {
      return rawPricePoints;
    }

    const last = rawPricePoints[rawPricePoints.length - 1];
    const intervalMs = interval * 1000;

    // Within half an interval the live price belongs to the last bucket rather than
    // to a new one, otherwise the series grows a point on every tick.
    if (livePrice.time - last.time < intervalMs * 0.5) {
      return [...rawPricePoints.slice(0, -1), { ...last, value: livePrice.value }];
    }

    return [...rawPricePoints, { time: livePrice.time, value: livePrice.value }];
  }, [rawPricePoints, livePrice, interval]);

  const onSelectTimeframe = useCallback((timeframe: PriceChartTimeframe) => {
    setHoverPricePointIndex(null);
    setSelectedTimeframe(timeframe);
  }, []);

  useEffect(() => {
    priceHistoryCacheRef.current = {};
    lastFetchPriceHistoryTimeRef.current = {};
    setRawPricePoints([]);
  }, [priceId]);

  useEffect(() => {
    let sync = true;

    const loadPriceHistory = async () => {
      const cache = priceHistoryCacheRef.current[selectedTimeframe];
      const nowTs = Date.now();
      const lastFetched = lastFetchPriceHistoryTimeRef.current[selectedTimeframe] || 0;
      const shouldRefetch = nowTs - lastFetched >= HISTORY_REFETCH_INTERVAL;

      if (cache && !shouldRefetch) {
        setRawPricePoints(cache);

        return;
      }

      if (!shouldRefetch) {
        return;
      }

      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = nowTs;

      const { history } = await getHistoryTokenPrice(priceId, selectedTimeframe);

      if (sync) {
        priceHistoryCacheRef.current[selectedTimeframe] = history;
        setRawPricePoints(history);
      }
    };

    loadPriceHistory().catch(console.error);

    return () => {
      sync = false;
    };
  }, [priceId, selectedTimeframe]);

  // A currency change reprices the whole series, so the cache cannot be reused.
  useEffect(() => {
    let sync = true;

    if (currency !== prevCurrencyRef.current) {
      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = Date.now();

      getHistoryTokenPrice(priceId, selectedTimeframe)
        .then(({ history }) => {
          if (sync) {
            priceHistoryCacheRef.current[selectedTimeframe] = history;
            setRawPricePoints(history);
          }
        })
        .catch(console.error);

      prevCurrencyRef.current = currency;
    }

    return () => {
      sync = false;
    };
  }, [currency, priceId, selectedTimeframe]);

  useEffect(() => {
    let subscriptionId: string;
    let isSync = true;

    subscribeCurrentTokenPrice(priceId, setLivePrice)
      .then(({ id, price }) => {
        subscriptionId = id;

        if (isSync) {
          setLivePrice(price);
        }
      })
      .catch(console.error);

    return () => {
      isSync = false;

      if (subscriptionId) {
        cancelSubscription(subscriptionId).catch(console.error);
      }
    };
  }, [priceId]);

  return (
    <>
      <PriceInfoContainer hoverPricePointIndex={hoverPricePointIndex} pricePoints={mergedRawPricePoints} />

      <PriceChart
        hoverPricePointIndex={hoverPricePointIndex}
        pricePoints={mergedRawPricePoints}
        setHoverPricePointIndex={setHoverPricePointIndex}
        timeframe={selectedTimeframe}
      />

      <TimeframeSelector onSelect={onSelectTimeframe} selectedTimeframe={selectedTimeframe} />
    </>
  );
};

export const PriceChartArea = ({ isChartSupported, priceId }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);

  return (
    <View style={styles.container}>
      {priceId && isChartSupported ? (
        <Component priceId={priceId} />
      ) : (
        <PriceInfoUI change={0} percent={0} value={priceId ? priceMap[priceId] || 0 : 0} />
      )}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      // The upper block centres its children, so opt out or the chart and the
      // timeframe row collapse to their content width instead of filling the screen.
      alignSelf: 'stretch',
      paddingBottom: theme.paddingXXS,
      gap: theme.marginXS,
    },
  });
}
