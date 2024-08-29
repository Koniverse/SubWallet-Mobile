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
import { Plus, Vault } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Keyboard, Linking, RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningScreenNavigationProps } from 'routes/earning';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ExtraYieldPositionInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';
import { LeftIconButton } from 'components/LeftIconButton';
import { isRelatedToAstar } from 'utils/earning';
import { BannerGenerator } from 'components/common/BannerGenerator';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { ListRenderItemInfo } from '@shopify/flash-list';

let cacheData: Record<string, boolean> = {};

interface Props {
  setStep: (value: number) => void;
  loading: boolean;
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

export const PositionList = ({ setStep, loading }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const isFocused = useIsFocused();
  const [isRefresh, refresh] = useRefresh();
  const data = useGroupYieldPosition();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('earning');
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const { assetRegistry: assetInfoMap } = useSelector((state: RootState) => state.assetRegistry);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const BN_TEN = new BigNumber(10);
    return data
      .map((item): ExtraYieldPositionInfo => {
        const priceToken = assetInfoMap[item.balanceToken];
        const price = priceMap[priceToken?.priceId || ''] || 0;

        return {
          ...item,
          asset: priceToken,
          price,
          currency: currencyData,
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
  }, [assetInfoMap, currencyData, data, priceMap]);

  const handleOnPress = useCallback(
    (positionInfo: ExtraYieldPositionInfo): (() => void) => {
      if (isRelatedToAstar(positionInfo.slug)) {
        return () => {
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
        };
      }
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
        title={i18n.emptyScreen.positionEmptyTitle}
        icon={Vault}
        message={i18n.emptyScreen.positionEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'staking' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.exploreEarningOptions}
        onPressAddBtn={handlePressStartStaking}
      />
    );
  }, [handlePressStartStaking, isRefresh, refresh]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ExtraYieldPositionInfo>) => {
      return (
        <>
          <EarningInfoItem key={item.slug} positionInfo={item} onPress={handleOnPress} isShowBalance={isShowBalance} />

          {index === items.length - 1 && (
            <View style={{ alignItems: 'center' }}>
              <LeftIconButton
                icon={Plus}
                title={i18n.buttonTitles.exploreEarningOptions}
                onPress={handlePressStartStaking}
              />
            </View>
          )}
        </>
      );
    },
    [handleOnPress, handlePressStartStaking, isShowBalance, items.length],
  );

  const rightIconOption = useMemo(() => {
    return {
      icon: Plus,
      onPress: handlePressStartStaking,
    };
  }, [handlePressStartStaking]);

  const searchFunction = useCallback(
    (_items: ExtraYieldPositionInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain, asset }) => {
        const chainInfo = chainInfoMap[_chain];
        return (
          chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()) ||
          asset?.symbol.toLowerCase().includes(searchString.toLowerCase())
        );
      });
    },
    [chainInfoMap],
  );

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
    <FlatListScreen
      style={styles.wrapper}
      title={i18n.header.positionList}
      titleTextAlign={'left'}
      items={items}
      showLeftBtn={false}
      placeholder={i18n.placeholder.searchToken}
      autoFocus={false}
      loading={loading || isRefresh}
      renderListEmptyComponent={renderEmpty}
      searchFunction={searchFunction}
      filterOptions={FILTER_OPTIONS}
      filterFunction={filterFunction}
      flatListStyle={styles.container}
      renderItem={renderItem}
      rightIconOption={rightIconOption}
      estimatedItemSize={76}
      keyExtractor={item => item.slug}
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
  );
};

export default PositionList;
