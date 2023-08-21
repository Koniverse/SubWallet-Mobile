import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import { StakingDataType } from 'hooks/types';
import { Plus, Trophy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ListRenderItemInfo, RefreshControl } from 'react-native';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { reloadCron } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import useGetStakingList from 'hooks/screen/Home/Staking/useGetStakingList';
import { StakingDetailModal } from 'screens/Home/Staking/StakingDetail/StakingDetailModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { RootNavigationProps } from 'routes/index';
import { EmptyList } from 'components/EmptyList';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import BigNumber from 'bignumber.js';

enum FilterValue {
  NOMINATED = 'nominated',
  POOLED = 'pooled',
}

const renderEmpty = (val?: string) => {
  if (val) {
    return (
      <EmptyList
        title={i18n.emptyScreen.stakingEmptyTitle}
        icon={Trophy}
        message={i18n.emptyScreen.stakingEmptyMessage}
      />
    );
  } else {
    return <EmptyStaking />;
  }
};

const filterFunction = (items: StakingDataType[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.NOMINATED:
          if (item.staking.type === StakingType.NOMINATED) {
            return true;
          }
          break;
        case FilterValue.POOLED:
          if (item.staking.type === StakingType.POOLED) {
            return true;
          }
      }
    }
    return false;
  });
};

const searchFunction = (items: StakingDataType[], searchString: string) => {
  return items.filter(({ staking }) => {
    return staking.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase());
  });
};

const StakingBalanceList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { data, priceMap } = useGetStakingList();
  const navigation = useNavigation<RootNavigationProps>();
  const [isRefresh, refresh] = useRefresh();
  const [selectedItem, setSelectedItem] = useState<StakingDataType | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const handleOnPress = useCallback((stakingData: StakingDataType): (() => void) => {
    return () => {
      Keyboard.dismiss();
      setSelectedItem(stakingData);
      setDetailModalVisible(true);
    };
  }, []);
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.nominated, value: FilterValue.NOMINATED },
    { label: i18n.filterOptions.pooled, value: FilterValue.POOLED },
  ];
  const stakingList = useMemo(() => {
    console.log(data);
    if (!data.length) {
      return [];
    }
    const BN_TEN = new BigNumber(10);
    const result = data.sort((firstItem, secondItem) => {
      const firstPrice = priceMap[`${firstItem.staking.chain}`] || 0;
      const firstValue =
        // @ts-ignore
        new BigNumber(firstItem.staking.balance).dividedBy(BN_TEN.pow(firstItem.decimals)).toFixed() * firstPrice;
      const secondPrice = priceMap[`${secondItem.staking.chain}`] || 0;
      const secondValue =
        // @ts-ignore
        new BigNumber(secondItem.staking.balance).dividedBy(BN_TEN.pow(secondItem.decimals)).toFixed() * secondPrice;
      console.log(firstValue, secondValue);
      return secondValue - firstValue;
    });
    return result;
  }, [data, priceMap]);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  const renderItem = useCallback(
    ({ item: stakingData }: ListRenderItemInfo<StakingDataType>) => {
      return (
        <StakingBalanceItem
          key={stakingData.staking.chain}
          stakingData={stakingData}
          priceMap={priceMap}
          onPress={handleOnPress}
        />
      );
    },
    [handleOnPress, priceMap],
  );

  const handlePressStartStaking = useCallback(
    () =>
      navigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Stake',
          params: {},
        },
      }),
    [navigation],
  );

  const rightIconOption = useMemo(() => {
    return {
      icon: Plus,
      onPress: handlePressStartStaking,
    };
  }, [handlePressStartStaking]);

  return (
    <>
      <FlatListScreen
        style={{ flex: 1, paddingBottom: 16 }}
        title={i18n.header.staking}
        titleTextAlign={'left'}
        items={stakingList}
        showLeftBtn={false}
        placeholder={i18n.placeholder.searchToken}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={searchFunction}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
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

      {selectedItem && (
        <StakingDetailModal
          modalVisible={detailModalVisible}
          chainStakingMetadata={selectedItem.chainStakingMetadata}
          nominatorMetadata={selectedItem.nominatorMetadata}
          rewardItem={selectedItem.reward}
          staking={selectedItem.staking}
          setDetailModalVisible={setDetailModalVisible}
        />
      )}
    </>
  );
};

export default React.memo(StakingBalanceList);
