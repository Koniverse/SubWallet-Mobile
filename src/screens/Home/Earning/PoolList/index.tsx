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
import { Trophy } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, ListRenderItemInfo, RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningPoolListProps } from 'routes/earning';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { AppModalContext } from 'providers/AppModalContext';
import useChainChecker from 'hooks/chain/useChainChecker';
import ModalBase from 'components/Modal/Base/ModalBase';
import { deviceWidth } from 'constants/index';
import { ActivityIndicator, Typography } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';

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
    params: { group: poolGroup, symbol },
  },
}: EarningPoolListProps) => {
  const theme = useSubWalletTheme().swThemes;
  const isFocused = useIsFocused();
  const navigation = useNavigation<RootNavigationProps>();

  const [isRefresh, refresh] = useRefresh();
  const pools = useYieldPoolInfoByGroup(poolGroup);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const appModalContext = useContext(AppModalContext);
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [state, setState] = React.useState({ num: 0 });
  const [selectedPoolOpt, setSelectedPoolOpt] = React.useState<YieldPoolInfo | undefined>(undefined);
  const counter = useRef(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: YieldPoolInfo[] = useMemo(() => {
    if (!pools.length) {
      return [];
    }
    const result = [...pools];

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

  const connectChain = useCallback(
    (chainSlug: string) => {
      setTimeout(() => {
        appModalContext.setConfirmModal({
          visible: true,
          completeBtnTitle: i18n.buttonTitles.enable,
          message: i18n.common.enableChainMessage,
          title: i18n.common.enableChain,
          onCancelModal: () => {
            appModalContext.hideConfirmModal();
          },
          onCompleteModal: () => {
            turnOnChain(chainSlug);
            setLoading(true);
            setTimeout(() => appModalContext.hideConfirmModal(), 0);
          },
          messageIcon: chainSlug,
        });
      }, 300);
    },
    [appModalContext, turnOnChain],
  );

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

  const onPressItem = useCallback(
    (chainSlug: string, poolInfo: YieldPoolInfo) => {
      counter.current = 0;
      setSelectedPoolOpt(poolInfo);
      if (!checkChainConnected(chainSlug)) {
        connectChain(chainSlug);
      } else {
        handleOnStakeMore(poolInfo.slug);
      }
    },
    [checkChainConnected, connectChain, handleOnStakeMore],
  );

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isLoading && selectedPoolOpt) {
      if (counter.current < 2) {
        counter.current += 1;
        timer = setTimeout(() => setState({ num: state.num + 1 }), 1000);
      } else {
        if (checkChainConnected(chainInfoMap[selectedPoolOpt.chain].slug)) {
          setLoading(false);
          setTimeout(() => handleOnStakeMore(selectedPoolOpt.slug), 100);
        } else {
          Alert.alert('Error', 'Failed to get data. Please try again later', [
            {
              text: 'Continue',
              style: 'destructive',
            },
          ]);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [chainInfoMap, checkChainConnected, handleOnStakeMore, isLoading, selectedPoolOpt, state.num]);

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
          chain={chainInfoMap[item.chain]}
          key={item.slug}
          onStakeMore={() => onPressItem(chainInfoMap[item.chain].slug, item)}
          poolInfo={item}
        />
      );
    },
    [chainInfoMap, onPressItem],
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
        style={styles.wrapper}
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

      <ModalBase
        isVisible={isLoading}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
        backdropColor={'#1A1A1A'}
        backdropOpacity={0.8}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        hideModalContentWhileAnimating>
        <View
          style={{
            width: deviceWidth * 0.6,
            height: 100,
            backgroundColor: theme.colorBgDefault,
            borderRadius: theme.borderRadiusXL,
            padding: theme.padding,
            gap: theme.padding,
            alignItems: 'center',
          }}>
          <>
            <ActivityIndicator size={32} />
            <Typography.Text style={{ color: theme.colorTextLight1, ...FontMedium }}>Getting data</Typography.Text>
          </>
        </View>
      </ModalBase>
    </>
  );
};

export default PoolList;
