import { useIsFocused, useNavigation } from '@react-navigation/native';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningPoolItem from 'components/Item/Earning/EarningPoolItem';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { reloadCron, saveCurrentAccountAddress } from 'messaging/index';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Keyboard, Linking, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningPreviewPoolsProps, RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { useHandleChainConnection } from 'hooks/earning/useHandleChainConnection';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { DataContext } from 'providers/DataContext';
import { fetchStaticCache } from '@subwallet/extension-base/utils/fetchStaticCache';
import { LoadingScreen } from 'screens/LoadingScreen';
import { usePreviewYieldPoolInfoByGroup } from 'hooks/earning';
import { mmkvStore } from 'utils/storage';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { getFilteredAccount } from '../../../AppNavigator';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { getStartEarningUrl } from '..';
import { analysisAccounts } from 'hooks/screen/Home/Crypto/useGetChainSlugsByAccountType';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

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
  { label: i18n.filterOptions.directNomination, value: YieldPoolType.NATIVE_STAKING },
  { label: i18n.filterOptions.liquidStaking, value: YieldPoolType.LIQUID_STAKING },
  { label: i18n.filterOptions.lending, value: YieldPoolType.LENDING },
  { label: i18n.filterOptions.parachainStaking, value: YieldPoolType.PARACHAIN_STAKING },
  { label: i18n.filterOptions.singleFarming, value: YieldPoolType.SINGLE_FARMING },
];

interface ComponentProps {
  poolInfoMap: Record<string, YieldPoolInfo>;
  poolGroup: string;
  symbol: string;
}

const Component = ({ poolGroup, poolInfoMap, symbol }: ComponentProps) => {
  const theme = useSubWalletTheme().swThemes;
  const isFocused = useIsFocused();
  const navigation = useNavigation<RootNavigationProps>();
  const [isRefresh, refresh] = useRefresh();
  const pools = usePreviewYieldPoolInfoByGroup(poolGroup, poolInfoMap);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [selectedPoolOpt, setSelectedPoolOpt] = React.useState<YieldPoolInfo | undefined>(undefined);
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const { accounts, isNoAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const [isContainOnlySubstrate] = analysisAccounts(accounts);
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

  const checkIsAnyAccountValid = useCallback((_accounts: AccountJson[], chainInfo: _ChainInfo) => {
    let accountList: AccountJson[] = [];

    if (!chainInfo) {
      return false;
    }

    accountList = _accounts.filter(getFilteredAccount(chainInfo));

    return !!accountList.length;
  }, []);

  const navigateToEarnTransaction = useCallback(
    (slug: string, chain: string) => {
      if (isNoAccount) {
        mmkvStore.set('storedDeeplink', getStartEarningUrl(slug));
        Linking.openURL(getStartEarningUrl(slug));
      } else {
        const chainInfo = chainInfoMap[chain];
        const isAnyAccountValid = checkIsAnyAccountValid(accounts, chainInfo);

        if (!isAnyAccountValid) {
          const accountType = isContainOnlySubstrate ? EVM_ACCOUNT_TYPE : SUBSTRATE_ACCOUNT_TYPE;
          mmkvStore.set('storedDeeplink', getStartEarningUrl(slug));
          navigation.navigate('Home', {
            screen: 'Main',
            params: {
              screen: 'Earning',
              params: { screen: 'EarningList', params: { step: 1, noAccountValid: true, accountType, chain } },
            },
          });
        } else {
          const accountList = accounts.filter(getFilteredAccount(chainInfo));

          if (accountList.length === 1) {
            saveCurrentAccountAddress(accountList[0])
              .then(() => Linking.openURL(getStartEarningUrl(slug)))
              .catch(() => console.error());
          } else {
            if (currentAccount && accountList.some(acc => acc.address === currentAccount.address)) {
              Linking.openURL(getStartEarningUrl(slug));

              return;
            }

            saveCurrentAccountAddress({ address: 'ALL' })
              .then(() => Linking.openURL(getStartEarningUrl(slug)))
              .catch(() => console.error());
          }
        }
      }
    },
    [accounts, chainInfoMap, checkIsAnyAccountValid, currentAccount, isContainOnlySubstrate, isNoAccount, navigation],
  );

  const { checkChainConnected, onConnectChain, isLoading, turnOnChain, setLoading } = useHandleChainConnection(
    selectedPoolOpt?.chain,
    selectedPoolOpt?.metadata.shortName,
    () => {
      setTimeout(() => selectedPoolOpt && navigateToEarnTransaction(selectedPoolOpt.slug, selectedPoolOpt.chain), 100);
    },
    altChainData,
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: YieldPoolInfo[] = useMemo(() => {
    if (!pools.length) {
      return [];
    }
    const result = [...pools].filter(
      item =>
        !(
          (item.chain === 'parallel' && item.type === YieldPoolType.LIQUID_STAKING) ||
          (item.chain === 'interlay' && item.type === YieldPoolType.LENDING)
        ),
    );

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
  }, [pools]);

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
        navigateToEarnTransaction(poolInfo?.slug, poolInfo.chain);
      }
    },
    [checkChainConnected, getAltChain, navigateToEarnTransaction, onConnectChain, setLoading, turnOnChain],
  );

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.poolEmptyTitle}
        icon={Trophy}
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
    navigation.navigate('EarningPreview', { chain: '', type: '', target: '' });
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
        title={i18n.header.poolList.replace('{{symbol}}', symbol)}
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

export const EarningPreviewPools = ({
  route: {
    params: { group: poolGroup, symbol },
  },
}: EarningPreviewPoolsProps) => {
  const dataContext = useContext(DataContext);
  const [poolInfoMap, setPoolInfoMap] = useState<Record<string, YieldPoolInfo>>({});
  const { isLocked, isNoAccount } = useSelector((state: RootState) => state.accountState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isSync = true;

    fetchStaticCache<{ data: Record<string, YieldPoolInfo> }>('earning/yield-pools.json', { data: {} })
      .then(rs => {
        if (isSync) {
          setPoolInfoMap(rs.data);
        }
      })
      .catch(e => {
        console.log('Error when fetching yield-pools.json', e);
      });

    return () => {
      isSync = false;
    };
  }, []);

  useEffect(() => {
    let isSync = true;

    if (!isReady) {
      dataContext
        .awaitStores(['price'])
        .then(rs => {
          if (rs && !!poolInfoMap && isSync) {
            setIsReady(true);
          }
        })
        .catch(console.log);
    }

    return () => {
      isSync = false;
    };
  }, [dataContext, isReady, poolInfoMap]);

  const isLoading = useMemo(() => {
    if (isNoAccount) {
      return !isReady;
    } else {
      return !isReady || isLocked;
    }
  }, [isLocked, isNoAccount, isReady]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Component poolInfoMap={poolInfoMap} poolGroup={poolGroup} symbol={symbol} />;
};
