import { useIsFocused, useNavigation } from '@react-navigation/native';
import { YieldPoolType } from '@subwallet/extension-base/types';
import BigNumber from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningInfoItem from 'components/Item/Earning/EarningInfoItem';
import { useGroupYieldPosition } from 'hooks/earning';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { reloadCron } from 'messaging/index';
import { Plus, Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningScreenNavigationProps } from 'routes/earning';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ExtraYieldPositionInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';

let cacheData: Record<string, boolean> = {};

interface Props {
  setStep: (value: number) => void;
  chainInfoMap: Record<string, _ChainInfo>;
  isShowBalance: boolean;
}

const filterFunction = (items: ExtraYieldPositionInfo[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    if (!filters.length) {
      return true;
    }

    for (const filter of filters) {
      if (filter === '') {
        return true;
      }

      if (filter === YieldPoolType.NOMINATION_POOL) {
        if (item.type === YieldPoolType.NOMINATION_POOL) {
          return true;
        }
      } else if (filter === YieldPoolType.NATIVE_STAKING) {
        if (item.type === YieldPoolType.NATIVE_STAKING) {
          return true;
        }
      } else if (filter === YieldPoolType.LIQUID_STAKING) {
        if (item.type === YieldPoolType.LIQUID_STAKING) {
          return true;
        }
      } else if (filter === YieldPoolType.LENDING) {
        if (item.type === YieldPoolType.LENDING) {
          return true;
        }
        // } else if (filter === YieldPoolType.PARACHAIN_STAKING) {
        //   if (item.type === YieldPoolType.PARACHAIN_STAKING) {
        //     return true;
        //   }
        // } else if (filter === YieldPoolType.SINGLE_FARMING) {
        //   if (item.type === YieldPoolType.SINGLE_FARMING) {
        //     return true;
        //   }
      }
    }

    return false;
  });
};

const FILTER_OPTIONS = [
  { label: i18n.filterOptions.nominationPool, value: YieldPoolType.NOMINATION_POOL },
  { label: i18n.filterOptions.directNomination, value: YieldPoolType.NATIVE_STAKING },
  { label: i18n.filterOptions.liquidStaking, value: YieldPoolType.LIQUID_STAKING },
  { label: i18n.filterOptions.lending, value: YieldPoolType.LENDING },
  { label: i18n.filterOptions.parachainStaking, value: YieldPoolType.PARACHAIN_STAKING },
  { label: i18n.filterOptions.singleFarming, value: YieldPoolType.SINGLE_FARMING },
];

export const PositionList = ({ setStep, chainInfoMap, isShowBalance }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const isFocused = useIsFocused();
  const [isRefresh, refresh] = useRefresh();
  const data = useGroupYieldPosition();
  const { priceMap } = useSelector((state: RootState) => state.price);
  const { assetRegistry: assetInfoMap } = useSelector((state: RootState) => state.assetRegistry);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const chainInfoMapRef = useRef<Record<string, _ChainInfo>>(chainInfoMap);
  const assetInfoMapRef = useRef<Record<string, _ChainAsset>>(assetInfoMap);
  const priceMapRef = useRef<Record<string, number>>(priceMap);

  useEffect(() => {
    chainInfoMapRef.current = chainInfoMap;
    assetInfoMapRef.current = assetInfoMap;
    priceMapRef.current = priceMap;
  }, [assetInfoMap, chainInfoMap, priceMap]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const BN_TEN = new BigNumber(10);
    return data
      .map((item): ExtraYieldPositionInfo => {
        const priceToken = assetInfoMapRef.current[item.balanceToken];
        const price = priceMapRef.current[priceToken?.priceId || ''] || 0;

        return {
          ...item,
          asset: priceToken,
          price,
        };
      })
      .sort((firstItem, secondItem) => {
        const getValue = (item: ExtraYieldPositionInfo): number => {
          return new BigNumber(item.totalStake)
            .dividedBy(BN_TEN.pow(item.asset.decimals || 0))
            .multipliedBy(item.price)
            .toNumber();
        };
        return getValue(secondItem) - getValue(firstItem);
      });
  }, [data]);

  const handleOnPress = useCallback(
    (positionInfo: ExtraYieldPositionInfo): (() => void) => {
      return () => {
        Keyboard.dismiss();
        navigation.navigate('EarningPositionDetail', { earningSlug: positionInfo.slug });
      };
    },
    [navigation],
  );

  const handlePressStartStaking = useCallback(() => setStep(2), [setStep]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.stakingEmptyTitle}
        icon={Trophy}
        message={i18n.emptyScreen.stakingEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.startStaking}
        onPressAddBtn={handlePressStartStaking}
      />
    );
  }, [handlePressStartStaking, isRefresh, refresh]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExtraYieldPositionInfo>) => {
      return (
        <EarningInfoItem key={item.slug} positionInfo={item} onPress={handleOnPress} isShowBalance={isShowBalance} />
      );
    },
    [handleOnPress, isShowBalance],
  );

  const rightIconOption = useMemo(() => {
    return {
      icon: Plus,
      onPress: handlePressStartStaking,
    };
  }, [handlePressStartStaking]);

  const searchFunction = useCallback((_items: ExtraYieldPositionInfo[], searchString: string) => {
    return _items.filter(({ chain: _chain, balanceToken }) => {
      const chainInfo = chainInfoMapRef.current[_chain];
      const assetInfo = assetInfoMapRef.current[balanceToken];

      return (
        chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()) ||
        assetInfo?.symbol.toLowerCase().includes(searchString.toLowerCase())
      );
    });
  }, []);

  useEffect(() => {
    const address = currentAccount?.address || '';
    if (cacheData[address] === undefined && isFocused) {
      cacheData = { [address]: !items.length };
    }
  }, [items.length, currentAccount, isFocused]);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <>
      <FlatListScreen
        style={styles.wrapper}
        title={i18n.header.positionList}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={false}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        flatListStyle={styles.container}
        renderItem={renderItem}
        rightIconOption={rightIconOption}
        isShowFilterBtn
        isShowMainHeader
        refreshControl={
          <RefreshControl
            style={styles.refreshIndicator}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => {
              refresh(reloadCron({ data: 'staking' }));
            }}
          />
        }
      />
    </>
  );
};

export default PositionList;
