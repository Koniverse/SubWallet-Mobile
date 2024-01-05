import { useIsFocused, useNavigation } from '@react-navigation/native';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningPoolItem from 'components/Item/Earning/EarningPoolItem';
import EarningPoolDetailModal from 'components/Modal/Earning/EarningPoolDetailModal';
import useYieldPoolInfoByGroup from 'hooks/earning/useYieldPoolInfoByGroup';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
import { EarningPoolListProps } from 'routes/earning';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { reloadCron } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootNavigationProps } from 'routes/index';
import { EmptyList } from 'components/EmptyList';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStyles from './style';

const filterFunction = (items: YieldPoolInfo[], filters: string[]) => {
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
  { label: i18n.filterOptions.nativeStaking, value: YieldPoolType.NATIVE_STAKING },
  { label: i18n.filterOptions.liquidStaking, value: YieldPoolType.LIQUID_STAKING },
  { label: i18n.filterOptions.lending, value: YieldPoolType.LENDING },
  { label: i18n.filterOptions.parachainStaking, value: YieldPoolType.PARACHAIN_STAKING },
  { label: i18n.filterOptions.singleFarming, value: YieldPoolType.SINGLE_FARMING },
];

export const PoolList: React.FC<EarningPoolListProps> = ({
  route: {
    params: { group: poolGroup },
  },
}: EarningPoolListProps) => {
  const theme = useSubWalletTheme().swThemes;
  const isFocused = useIsFocused();
  const navigation = useNavigation<RootNavigationProps>();

  const [isRefresh, refresh] = useRefresh();
  const pools = useYieldPoolInfoByGroup(poolGroup);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  const items: YieldPoolInfo[] = useMemo(() => {
    if (!pools.length) {
      return [];
    }
    const result = [...pools];

    result.sort((a, b) => {
      const getApy = (pool: YieldPoolInfo) => {
        const totalApy = pool.statistic?.totalApy;
        const totalApr = pool.statistic?.totalApr;
        if (totalApy) {
          return totalApy;
        }

        if (totalApr) {
          const rs = calculateReward(totalApr);

          return rs.apy || -1;
        }

        return -1;
      };

      const getTotal = (pool: YieldPoolInfo) => {
        const tvl = pool.statistic?.tvl;
        return tvl ? new BigN(tvl).toNumber() : -1;
      };

      return getTotal(b) - getTotal(a) || getApy(b) - getApy(a);
    });

    return result;
  }, [pools]);

  const handleOnStakeMore = useCallback(
    (slug: string): void => {
      Keyboard.dismiss();
      navigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Earning',
          params: { slug },
        },
      });
    },
    [navigation],
  );

  const handleOpenDetailModal = useCallback((slug: string): void => {
    Keyboard.dismiss();
    setSelectedSlug(slug);
    setDetailModalVisible(true);
  }, []);

  const onChangeModalVisible = useCallback((value: boolean) => {
    setSelectedSlug('');
    setDetailModalVisible(value);
  }, []);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.stakingEmptyTitle}
        icon={Trophy}
        message={i18n.emptyScreen.stakingEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.backToHome}
        onPressAddBtn={handleBack}
      />
    );
  }, [handleBack, isRefresh, refresh]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldPoolInfo>) => {
      return (
        <EarningPoolItem
          key={item.slug}
          onStakeMore={handleOnStakeMore}
          onOpenPopup={handleOpenDetailModal}
          poolInfo={item}
          standAlone={items.length === 1}
        />
      );
    },
    [handleOnStakeMore, handleOpenDetailModal, items.length],
  );

  // const rightIconOption = useMemo(() => {
  //   return {
  //     icon: Plus,
  //     onPress: handlePressStartStaking,
  //   };
  // }, [handlePressStartStaking]);

  const searchFunction = useCallback(
    (_items: YieldPoolInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain, metadata: { shortName } }) => {
        const chainInfo = chainInfoMap[_chain];

        return (
          chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()) ||
          shortName.toLowerCase().includes(searchString.toLowerCase())
        );
      });
    },
    [chainInfoMap],
  );

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <>
      <FlatListScreen
        style={styles.wrapper}
        title={i18n.header.earning}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={true}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={styles.container}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onBack}
        // rightIconOption={rightIconOption}
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

      {selectedSlug && (
        <EarningPoolDetailModal
          modalVisible={detailModalVisible}
          slug={selectedSlug}
          setVisible={onChangeModalVisible}
          onStakeMore={handleOnStakeMore}
        />
      )}
    </>
  );
};

export default PoolList;
