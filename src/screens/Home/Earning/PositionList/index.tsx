import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SpecialYieldPoolInfo, SpecialYieldPositionInfo } from '@subwallet/extension-base/types';
import BigNumber from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FlatListScreen } from 'components/FlatListScreen';
import EarningInfoItem from 'components/Item/Earning/EarningInfoItem';
import { useGroupYieldPosition } from 'hooks/earning';
import { useRefresh } from 'hooks/useRefresh';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { reloadCron } from 'messaging/index';
import { Plus, Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EarningScreenNavigationProps } from 'routes/earning';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ExtraYieldPositionInfo } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import createStyles from './style';

let cacheData: Record<string, boolean> = {};

export const PositionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const isFocused = useIsFocused();
  const [isRefresh, refresh] = useRefresh();
  const data = useGroupYieldPosition();

  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const { priceMap } = useSelector((state: RootState) => state.price);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry: assetInfoMap } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const BN_TEN = new BigNumber(10);
    return data
      .map((item): ExtraYieldPositionInfo => {
        let rate = 1;
        const priceToken = assetInfoMap[item.balanceToken];
        const price = priceMap[priceToken?.priceId || ''] || 0;

        if ('derivativeToken' in item) {
          const _item = item as SpecialYieldPositionInfo;
          const poolInfo = poolInfoMap[item.slug] as SpecialYieldPoolInfo;
          const balanceToken = _item.balanceToken;

          if (poolInfo) {
            const asset = poolInfo.metadata.assetEarning.find(i => i.slug === balanceToken);
            rate = asset?.exchangeRate || 1;
          }
        }

        return {
          ...item,
          asset: priceToken,
          price,
          exchangeRate: rate,
        };
      })
      .sort((firstItem, secondItem) => {
        const getValue = (item: ExtraYieldPositionInfo): number => {
          return new BigNumber(firstItem.totalStake)
            .multipliedBy(item.exchangeRate)
            .dividedBy(BN_TEN.pow(item.asset.decimals || 0))
            .multipliedBy(item.price)
            .toNumber();
        };
        return getValue(secondItem) - getValue(firstItem);
      });
  }, [assetInfoMap, data, poolInfoMap, priceMap]);

  const [autoNavigate, setAutoNavigate] = useState<boolean>(cacheData[currentAccount?.address || ''] || false);

  const handleOnPress = useCallback(
    (positionInfo: ExtraYieldPositionInfo): (() => void) => {
      return () => {
        Keyboard.dismiss();
        navigation.navigate('EarningPositionDetail', { slug: positionInfo.slug });
      };
    },
    [navigation],
  );

  const handlePressStartStaking = useCallback(() => navigation.navigate('EarningGroupList'), [navigation]);

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

  const searchFunction = useCallback(
    (_items: ExtraYieldPositionInfo[], searchString: string) => {
      return _items.filter(({ chain: _chain, balanceToken }) => {
        const chainInfo = chainInfoMap[_chain];
        const assetInfo = assetInfoMap[balanceToken];

        return (
          chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()) ||
          assetInfo?.symbol.toLowerCase().includes(searchString.toLowerCase())
        );
      });
    },
    [assetInfoMap, chainInfoMap],
  );

  useEffect(() => {
    const address = currentAccount?.address || '';
    if (cacheData[address] === undefined && isFocused) {
      cacheData = { [address]: !items.length };
      setAutoNavigate(!items.length);
    }
  }, [items.length, currentAccount, isFocused]);

  useEffect(() => {
    if (autoNavigate && isFocused) {
      Keyboard.dismiss();
      navigation.navigate('EarningGroupList');
      setAutoNavigate(false);
      for (const address of Object.keys(cacheData)) {
        cacheData[address] = false;
      }
    }
  }, [autoNavigate, navigation, isFocused]);

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
        showLeftBtn={false}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
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
