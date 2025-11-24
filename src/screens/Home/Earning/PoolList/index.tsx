import { useIsFocused, useNavigation } from '@react-navigation/native';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningPoolItem from 'components/Item/Earning/EarningPoolItem';
import useYieldPoolInfoByGroup from 'hooks/earning/useYieldPoolInfoByGroup';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { reloadCron } from 'messaging/index';
import { Vault } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Keyboard, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningPoolListProps } from 'routes/earning';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { useHandleChainConnection } from 'hooks/earning/useHandleChainConnection';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import useAccountBalance, { getBalanceValue } from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useGroupYieldPosition } from 'hooks/earning';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';
import { RELAY_HANDLER_DIRECT_STAKING_CHAINS } from 'constants/chain';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';

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
      } else if (filter === YieldPoolType.SUBNET_STAKING) {
        if (item.type === YieldPoolType.SUBNET_STAKING) {
          return true;
        }
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
  { label: i18n.filterOptions.subnetStaking, value: YieldPoolType.SUBNET_STAKING },
];

export const PoolList: React.FC<EarningPoolListProps> = ({
  route: {
    params: { group: poolGroup, symbol },
  },
}: EarningPoolListProps) => {
  const theme = useSubWalletTheme().swThemes;
  const isFocused = useIsFocused();
  const navigation = useNavigation<RootNavigationProps>();
  const [isRefresh, refresh] = useRefresh();
  const pools = useYieldPoolInfoByGroup(poolGroup);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [selectedPoolOpt, setSelectedPoolOpt] = React.useState<YieldPoolInfo | undefined>(undefined);
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const chainsByAccountType = useGetChainSlugsByCurrentAccountProxy();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, undefined, true);
  const yieldPositions = useGroupYieldPosition();

  const positionSlugs = useMemo(() => {
    return yieldPositions.map(p => p.slug);
  }, [yieldPositions]);

  const getAltChain = useCallback(
    (poolInfo?: YieldPoolInfo) => {
      if (!!poolInfo && (isLiquidPool(poolInfo) || isLendingPool(poolInfo))) {
        const asset = chainAsset[poolInfo?.metadata.altInputAssets || ''];

        return asset ? { chain: asset.originChain, name: asset.name } : { chain: '', name: '' };
      }

      return { chain: '', name: '' };
    },
    [chainAsset],
  );

  const altChainData = useMemo(() => {
    return getAltChain(selectedPoolOpt);
  }, [getAltChain, selectedPoolOpt]);

  const handleOnStakeMore = useCallback(
    (slug: string): void => {
      Keyboard.dismiss();
      delayActionAfterDismissKeyboard(() =>
        navigation.navigate('Drawer', {
          screen: 'TransactionAction',
          params: {
            screen: 'Earning',
            params: { slug },
          },
        }),
      );
    },
    [navigation],
  );

  const { checkChainConnected, onConnectChain, isLoading, turnOnChain, setLoading } = useHandleChainConnection(
    selectedPoolOpt?.chain,
    selectedPoolOpt?.metadata.shortName,
    () => {
      setTimeout(() => selectedPoolOpt && handleOnStakeMore(selectedPoolOpt.slug), 100);
    },
    altChainData,
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: YieldPoolInfo[] = useMemo(() => {
    if (!pools.length) {
      return [];
    }
    const result: YieldPoolInfo[] = [];

    pools.forEach(poolInfo => {
      if (poolInfo.chain === 'parallel' && poolInfo.type === YieldPoolType.LIQUID_STAKING) {
        return;
      }

      if (poolInfo.chain === 'interlay' && poolInfo.type === YieldPoolType.LENDING) {
        return;
      }

      if (
        poolInfo.type === YieldPoolType.NATIVE_STAKING &&
        RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(poolInfo.chain)
      ) {
        let minJoinPool: string;

        if (poolInfo.statistic && !positionSlugs.includes(poolInfo.slug)) {
          minJoinPool = poolInfo.statistic.earningThreshold.join;
        } else {
          minJoinPool = '0';
        }

        let nativeSlug: string | undefined;

        const nativeAsset =
          poolInfo && poolInfo?.statistic?.assetEarning.find(item => item.slug.toLowerCase().includes('native'));

        if (nativeAsset) {
          nativeSlug = nativeAsset.slug;
        }

        const assetInfo = nativeSlug && chainAsset[nativeSlug];
        const minJoinPoolBalanceValue =
          (assetInfo && getBalanceValue(minJoinPool, _getAssetDecimals(assetInfo))) || BN_ZERO;

        const availableBalance =
          (nativeSlug && tokenBalanceMap[nativeSlug] && tokenBalanceMap[nativeSlug].free.value) || BN_ZERO;

        if (availableBalance.isGreaterThanOrEqualTo(minJoinPoolBalanceValue)) {
          result.push(poolInfo);
        }
      } else {
        result.push(poolInfo);
      }
    });

    result.sort((a, b) => {
      const getType = (pool: YieldPoolInfo) => {
        if (pool.type === YieldPoolType.NOMINATION_POOL) {
          return 1;
        } else {
          return -1;
        }
      };

      const getTotal = (pool: YieldPoolInfo) => {
        const tvl = pool.statistic?.tvl;
        return tvl ? new BigN(tvl).toNumber() : -1;
      };

      return getTotal(b) - getTotal(a) || getType(b) - getType(a);
    });

    return result;
  }, [chainAsset, pools, positionSlugs, tokenBalanceMap]);

  const onPressItem = useCallback(
    (chainSlug: string, poolInfo: YieldPoolInfo) => {
      setSelectedPoolOpt(poolInfo);
      const { chain: altChain } = getAltChain(poolInfo);

      if (!checkChainConnected(chainSlug)) {
        onConnectChain(chainSlug, altChain);
      } else if (altChain && !checkChainConnected(altChain)) {
        turnOnChain(altChain);
        setLoading(true);
      } else {
        handleOnStakeMore(poolInfo?.slug);
      }
    },
    [checkChainConnected, getAltChain, handleOnStakeMore, onConnectChain, setLoading, turnOnChain],
  );

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.poolEmptyTitle}
        icon={Vault}
        message={i18n.emptyScreen.poolEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.backToHome}
      />
    );
  }, [isRefresh, refresh]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldPoolInfo>) => {
      return (
        <EarningPoolItem
          chain={chainInfoMap[item.chain]}
          key={item.slug}
          onStakeMore={() => {
            Keyboard.dismiss();
            delayActionAfterDismissKeyboard(() => onPressItem(chainInfoMap[item.chain].slug, item));
          }}
          poolInfo={item}
          currencyData={currencyData}
        />
      );
    },
    [chainInfoMap, currencyData, onPressItem],
  );

  const searchFunction = useCallback(
    (_items: YieldPoolInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain, metadata: { shortName } }) => {
        const chainInfo: _ChainInfo = chainInfoMap[_chain];

        return (
          chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()) ||
          shortName.toLowerCase().includes(searchString.toLowerCase())
        );
      });
    },
    [chainInfoMap],
  );

  const onBack = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'Main',
      params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 2 } } },
    });
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <>
      <FlatListScreen
        title={i18n.header.poolList.replace('{{symbol}}', symbol)}
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
        estimatedItemSize={113}
        // rightIconOption={rightIconOption}
        isShowFilterBtn
        isShowMainHeader
        isHideBottomSafeArea
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

      <GettingDataModal isLoading={isLoading} />
    </>
  );
};

export default PoolList;
