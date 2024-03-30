import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningGroupItem from 'components/Item/Earning/EarningGroupItem';
import { useYieldGroupInfo } from 'hooks/earning';
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Keyboard, Linking, ListRenderItemInfo, RefreshControl, View } from 'react-native';
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
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { GettingDataModal } from 'components/Modal/GettingDataModal';
import { useHandleChainConnection } from 'hooks/earning/useHandleChainConnection';
import { isRelatedToAstar } from 'utils/earning';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { BannerGenerator } from 'components/common/BannerGenerator';

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

const defaultSelectionMap = { [FilterOptionType.MAIN_NETWORK]: true };

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
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('earning');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedPoolGroup, setSelectedPoolGroup] = React.useState<YieldGroupInfo | undefined>(undefined);

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
    (poolGroup: YieldGroupInfo) => {
      const standAloneTokenSlug = Object.values(poolInfoMap).find(
        i => i.group === poolGroup.group && i.chain === poolGroup.chain,
      )?.slug;

      rootNavigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Earning',
          params: { slug: standAloneTokenSlug || '' },
        },
      });
    },
    [poolInfoMap, rootNavigation],
  );

  const { checkChainConnected, onConnectChain, isLoading, turnOnChain, setLoading } = useHandleChainConnection(
    selectedPoolGroup?.chain,
    selectedPoolGroup?.name,
    () => {
      setTimeout(() => selectedPoolGroup && navigateToEarnScreen(selectedPoolGroup), 100);
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
        icon={Trophy}
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
      if (poolGroup.poolListLength > 1) {
        navigation.navigate('EarningPoolList', { group: poolGroup.group, symbol: poolGroup.symbol });
      } else if (poolGroup.poolListLength === 1) {
        const poolInfo = Object.values(poolInfoMap).find(
          i => i.group === poolGroup.group && i.chain === poolGroup.chain,
        );

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
          navigateToEarnScreen(poolGroup);
        }
      }
    },
    [
      checkChainConnected,
      getAltChain,
      navigateToEarnScreen,
      navigation,
      onConnectChain,
      poolInfoMap,
      setLoading,
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
              Alert.alert(
                'Enter Astar portal',
                'You are navigating to Astar portal to view and manage your stake in Astar dApp staking v3. SubWallet will offer support for Astar dApp staking v3 soon.',
                [
                  {
                    text: 'Cancel',
                    style: 'default',
                  },
                  {
                    text: 'Enter Astar portal',
                    style: 'default',
                    isPreferred: false,
                    onPress: () => {
                      Linking.openURL('subwallet://browser?url=portal.astar.network');
                    },
                  },
                ],
              );
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
        defaultSelectionMap={defaultSelectionMap}
        filterFunction={filterFunction}
        flatListStyle={styles.container}
        renderItem={renderItem}
        onPressBack={onBack}
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
          <View style={{ paddingHorizontal: theme.padding }}>
            <BannerGenerator banners={banners} onPressBanner={onPressBanner} dismissBanner={dismissBanner} />
          </View>
        }
      />

      <GettingDataModal isLoading={isLoading} />
    </>
  );
};

export default GroupList;
