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
import createStyles from './styles';

export const PositionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<EarningScreenNavigationProps>();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const { priceMap } = useSelector((state: RootState) => state.price);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const assetInfoMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [isRefresh, refresh] = useRefresh();
  const [selectedItem, setSelectedItem] = useState<ExtraYieldPositionInfo | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const data = useGroupYieldPosition();
  const handleOnPress = useCallback((stakingData: ExtraYieldPositionInfo): (() => void) => {
    return () => {
      Keyboard.dismiss();
      setSelectedItem(stakingData);
      setDetailModalVisible(true);
    };
  }, []);

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

  const renderEmpty = () => {
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
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExtraYieldPositionInfo>) => {
      return (
        <EarningInfoItem key={item.slug} positionInfo={item} onPress={handleOnPress} isShowBalance={isShowBalance} />
      );
    },
    [handleOnPress, isShowBalance],
  );

  const handlePressStartStaking = useCallback(() => navigation.navigate('EarningGroupList'), [navigation]);

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

  return (
    <>
      <FlatListScreen
        style={{ flex: 1, paddingBottom: 16 }}
        title={i18n.header.earning}
        titleTextAlign={'left'}
        items={items}
        showLeftBtn={false}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        flatListStyle={{ paddingHorizontal: theme.padding, gap: theme.sizeXS, paddingBottom: 8 }}
        renderItem={renderItem}
        rightIconOption={rightIconOption}
        isShowFilterBtn
        isShowMainHeader
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark1 }}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => {
              refresh(reloadCron({ data: 'staking' }));
            }}
          />
        }
      />

      {/*{selectedItem && (*/}
      {/*  <StakingDetailModal*/}
      {/*    modalVisible={detailModalVisible}*/}
      {/*    chainStakingMetadata={selectedItem.chainStakingMetadata}*/}
      {/*    nominatorMetadata={selectedItem.nominatorMetadata}*/}
      {/*    rewardItem={selectedItem.reward}*/}
      {/*    staking={selectedItem.staking}*/}
      {/*    setDetailModalVisible={setDetailModalVisible}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
};

export default PositionList;
