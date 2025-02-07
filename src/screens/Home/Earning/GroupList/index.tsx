import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningGroupItem from 'components/Item/Earning/EarningGroupItem';
import { useGroupYieldPosition, useYieldGroupInfo } from 'hooks/earning';
import { Vault } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Keyboard, Linking, RefreshControl, View } from 'react-native';
import { EarningScreenNavigationProps } from 'routes/earning';
import { YieldGroupInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { reloadCron } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStyles from './style';
import { RootNavigationProps } from 'routes/index';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { useHandleChainConnection } from 'hooks/earning/useHandleChainConnection';
import { isRelatedToAstar } from 'utils/earning';
import useAccountBalance, { getBalanceValue } from 'hooks/screen/useAccountBalance';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { BannerGenerator } from 'components/common/BannerGenerator';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';

enum FilterOptionType {
  MAIN_NETWORK = 'MAIN_NETWORK',
  TEST_NETWORK = 'TEST_NETWORK',
}

const groupOrdinal = (group: YieldGroupInfo): number => {
  if (group.group === 'DOT-Polkadot') {
    return 2;
  } else if (group.group === 'KSM-Kusama') {
    return 1;
  } else {
    return 0;
  }
};

const testnetOrdinal = (group: YieldGroupInfo): number => {
  return group.isTestnet ? 0 : 1;
};

const availOrdinal = (group: YieldGroupInfo): number => {
  if (group.chain === 'goldberg_testnet') {
    return 1;
  } else {
    return 0;
  }
};

const balanceOrdinal = (group: YieldGroupInfo): number => {
  return group.balance.value.toNumber();
};

const apyOrdinal = (group: YieldGroupInfo): number => {
  return !group.maxApy ? -1 : group.maxApy;
};

const FILTER_OPTIONS = [
  { label: i18n.filterOptions.mainnet, value: FilterOptionType.MAIN_NETWORK },
  { label: i18n.filterOptions.testnet, value: FilterOptionType.TEST_NETWORK },
];

const filterFunction = (items: YieldGroupInfo[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    if (!filters.length || filters.length === FILTER_OPTIONS.length) {
      return true;
    }

    for (const filter of filters) {
      if (filter === '') {
        return true;
      }
      if (filter === FilterOptionType.MAIN_NETWORK) {
        return !item.isTestnet;
      } else if (filter === FilterOptionType.TEST_NETWORK) {
        return item.isTestnet;
      }
    }

    return false;
  });
};

interface Props {
  isHasAnyPosition: boolean;
  setStep: (value: number) => void;
}

export const GroupList = ({ isHasAnyPosition, setStep }: Props) => {
  const isFocused = useIsFocused();
  const theme = useSubWalletTheme().swThemes;
  const [isRefresh, refresh] = useRefresh();
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const data = useYieldGroupInfo();
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const chainsByAccountType = useGetChainSlugsByAccount();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, undefined, true);
  const yieldPositions = useGroupYieldPosition();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('earning');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedPoolGroup, setSelectedPoolGroup] = React.useState<YieldGroupInfo | undefined>(undefined);

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
    const poolInfo =
      selectedPoolGroup &&
      Object.values(poolInfoMap).find(i => i.group === selectedPoolGroup.group && i.chain === selectedPoolGroup.chain);

    return getAltChain(poolInfo);
  }, [getAltChain, poolInfoMap, selectedPoolGroup]);

  const navigateToEarnScreen = useCallback(
    (slug: string) => {
      rootNavigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Earning',
          params: { slug: slug || '' },
        },
      });
    },
    [rootNavigation],
  );

  const { checkChainConnected, onConnectChain, isLoading, turnOnChain, setLoading } = useHandleChainConnection(
    selectedPoolGroup?.chain,
    selectedPoolGroup?.name,
    () => {
      setTimeout(() => {
        if (selectedPoolGroup && selectedPoolGroup.poolSlugs[0]) {
          navigateToEarnScreen(selectedPoolGroup.poolSlugs[0]);
        }
      }, 100);
    },
    altChainData,
  );

  const items = useMemo(() => {
    return [...data].sort((a, b) => {
      return (
        groupOrdinal(b) - groupOrdinal(a) ||
        testnetOrdinal(b) - testnetOrdinal(a) ||
        availOrdinal(b) - availOrdinal(a) ||
        balanceOrdinal(b) - balanceOrdinal(a) ||
        apyOrdinal(b) - apyOrdinal(a)
      );
    });
  }, [data]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        title={i18n.emptyScreen.groupEmptyTitle}
        icon={Vault}
        message={i18n.emptyScreen.groupEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.startStaking}
      />
    );
  }, [isRefresh, refresh]);

  const onPressItem = useCallback(
    (chainSlug: string, poolGroup: YieldGroupInfo) => {
      setSelectedPoolGroup(poolGroup);

      const processPoolOptions = (poolInfo: YieldPoolInfo) => {
        if (!poolInfo) {
          // will not happen

          return;
        }

        const currentAltChainData = getAltChain(poolInfo);

        if (!checkChainConnected(chainSlug)) {
          onConnectChain(chainSlug, currentAltChainData.chain);
        } else if (!checkChainConnected(currentAltChainData.chain) && !!currentAltChainData.chain) {
          turnOnChain(currentAltChainData.chain);
          setLoading(true);
        } else {
          navigateToEarnScreen(poolInfo.slug);
        }
      };

      if (poolGroup.poolListLength > 1) {
        let isHiddenPool = false;

        if (poolGroup.poolListLength === 2) {
          poolGroup.poolSlugs.forEach(poolSlug => {
            const poolInfo = poolInfoMap[poolSlug];

            if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
              let minJoinPool: string;

              if (poolInfo.statistic && !positionSlugs.includes(poolSlug)) {
                minJoinPool = poolInfo.statistic.earningThreshold.join;
              } else {
                minJoinPool = '0';
              }

              const originChainAsset = poolInfo.metadata.inputAsset;

              const availableBalance =
                originChainAsset && tokenBalanceMap[originChainAsset] && tokenBalanceMap[originChainAsset].free.value;
              const assetInfo = chainAsset[originChainAsset];
              const minJoinPoolBalanceValue = getBalanceValue(minJoinPool, _getAssetDecimals(assetInfo));

              if (
                _STAKING_CHAIN_GROUP.relay.includes(poolInfo.chain) &&
                minJoinPoolBalanceValue.isGreaterThan(availableBalance)
              ) {
                isHiddenPool = true;
              }
            }
          });
        }

        if (isHiddenPool && poolGroup.poolListLength === 2) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const index = poolGroup.poolSlugs.findIndex(poolGroup =>
            poolGroup.includes(YieldPoolType.NOMINATION_POOL.toLowerCase()),
          );

          const poolInfo = poolInfoMap[poolGroup.poolSlugs[index]];

          processPoolOptions(poolInfo);
        } else {
          navigation.navigate('EarningPoolList', {
            group: poolGroup.group,
            symbol: poolGroup.symbol,
          });
        }
      } else if (poolGroup.poolListLength === 1) {
        const poolInfo = poolInfoMap[poolGroup.poolSlugs[0]];
        processPoolOptions(poolInfo);
      }
    },
    [
      chainAsset,
      checkChainConnected,
      getAltChain,
      navigateToEarnScreen,
      navigation,
      onConnectChain,
      poolInfoMap,
      positionSlugs,
      setLoading,
      tokenBalanceMap,
      turnOnChain,
    ],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<YieldGroupInfo>) => {
      return (
        <EarningGroupItem
          key={item.group}
          poolGroup={item}
          onPress={() => {
            if (isRelatedToAstar(item.group)) {
              Keyboard.dismiss();
              Alert.alert(i18n.warningTitle.enterAstarPortal, i18n.warningMessage.enterAstarPortalMessage, [
                {
                  text: i18n.buttonTitles.cancel,
                  style: 'default',
                },
                {
                  text: i18n.buttonTitles.enterAstarPortal,
                  style: 'default',
                  isPreferred: false,
                  onPress: () => {
                    Linking.openURL('subwallet://browser?url=portal.astar.network');
                  },
                },
              ]);
              return;
            }
            Keyboard.dismiss();
            onPressItem(item.chain, item);
          }}
          isShowBalance={isShowBalance}
        />
      );
    },
    [isShowBalance, onPressItem],
  );

  const onBack = useCallback(() => {
    if (isHasAnyPosition) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  }, [isHasAnyPosition, navigation, setStep]);

  const searchFunction = useCallback((_items: YieldGroupInfo[], searchString: string) => {
    return _items.filter(({ name, symbol }) => {
      return (
        name?.toLowerCase().includes(searchString.toLowerCase()) ||
        symbol?.toLowerCase().includes(searchString.toLowerCase())
      );
    });
  }, []);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  return (
    <>
      <FlatListScreen
        style={styles.wrapper}
        title={i18n.header.groupList}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={isHasAnyPosition}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        flatListStyle={styles.container}
        renderItem={renderItem}
        onPressBack={onBack}
        estimatedItemSize={74}
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
        beforeListItem={
          banners && banners.length ? (
            <View
              style={{ paddingHorizontal: theme.padding, paddingTop: theme.paddingXS, paddingBottom: theme.marginXXS }}>
              <BannerGenerator banners={banners} onPressBanner={onPressBanner} dismissBanner={dismissBanner} />
            </View>
          ) : (
            <></>
          )
        }
      />

      <GettingDataModal isLoading={isLoading} />
    </>
  );
};

export default GroupList;
