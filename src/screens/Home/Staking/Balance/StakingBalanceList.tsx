import { useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import { StakingDataType } from 'hooks/types';
import { Plus, Trophy } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { restartCronAndSubscriptionServices } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import useGetStakingList from 'hooks/screen/Home/Staking/useGetStakingList';
import { StakingDetailModal } from 'screens/Home/Staking/StakingDetail/StakingDetailModal';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';
import { Header } from 'components/Header';
import { ScreenContainer } from 'components/ScreenContainer';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { RootNavigationProps } from 'routes/index';
import { EmptyList } from 'components/EmptyList';

enum FilterValue {
  NOMINATED = 'nominated',
  POOLED = 'pooled',
}

const FILTER_OPTIONS = [
  { label: 'Nominated', value: FilterValue.NOMINATED },
  { label: 'Pooled', value: FilterValue.POOLED },
];

const renderEmpty = (val?: string) => {
  console.log('val', val);
  if (val) {
    return <EmptyList title={'No staking'} icon={Trophy} message={'Your staking accounts will appear here!'} />;
  } else {
    return <EmptyStaking />;
  }
};

const filterFunction = (items: StakingDataType[], filters: string[]) => {
  const filteredChainList: StakingDataType[] = [];

  if (!filters.length) {
    return items;
  }

  items.forEach(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.NOMINATED:
          if (item.staking.type === StakingType.NOMINATED) {
            filteredChainList.push(item);
          }
          break;
        case FilterValue.POOLED:
          if (item.staking.type === StakingType.POOLED) {
            filteredChainList.push(item);
          }
      }
    }
  });

  return filteredChainList;
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
  const [moreActionModalVisible, setMoreActionModalVisible] = useState<boolean>(false);

  const handleOnPress = useCallback((stakingData: StakingDataType): (() => void) => {
    return () => {
      setSelectedItem(stakingData);
      setDetailModalVisible(true);
    };
  }, []);

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
      navigation.navigate('TransactionAction', {
        screen: 'Stake',
        params: {},
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
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <Header />
        <FlatListScreen
          style={{ marginTop: 16 }}
          title={i18n.title.staking}
          items={data}
          showLeftBtn={false}
          autoFocus={false}
          renderListEmptyComponent={renderEmpty}
          searchFunction={searchFunction}
          filterOptions={FILTER_OPTIONS}
          filterFunction={filterFunction}
          renderItem={renderItem}
          rightIconOption={rightIconOption}
          isShowFilterBtn
          refreshControl={
            <RefreshControl
              style={{ backgroundColor: ColorMap.dark1 }}
              tintColor={ColorMap.light}
              refreshing={isRefresh}
              onRefresh={() => {
                refresh(
                  restartCronAndSubscriptionServices({
                    cronServices: ['staking'],
                    subscriptionServices: ['staking'],
                  }),
                );
              }}
            />
          }
          isShowPlaceHolder={false}
          needGapWithStatusBar={false}
        />

        {!!(selectedItem && selectedItem.nominatorMetadata && selectedItem.chainStakingMetadata) && (
          <StakingDetailModal
            modalVisible={detailModalVisible}
            onCloseDetailModal={() => setDetailModalVisible(false)}
            onOpenMoreActionModal={() => setMoreActionModalVisible(true)}
            chainStakingMetadata={selectedItem.chainStakingMetadata}
            nominatorMetadata={selectedItem.nominatorMetadata}
            rewardItem={selectedItem.reward}
            staking={selectedItem.staking}
          />
        )}

        <StakingActionModal
          closeModal={() => setMoreActionModalVisible(false)}
          openModal={() => setMoreActionModalVisible(true)}
          visible={moreActionModalVisible}
          chainStakingMetadata={selectedItem?.chainStakingMetadata}
          nominatorMetadata={selectedItem?.nominatorMetadata}
          staking={selectedItem?.staking}
          reward={selectedItem?.reward}
        />
      </>
    </ScreenContainer>
  );
};

export default React.memo(StakingBalanceList);
