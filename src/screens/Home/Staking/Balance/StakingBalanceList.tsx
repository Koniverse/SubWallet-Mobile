import { useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import useCurrentAccountCanSign from 'hooks/screen/useCurrentAccountCanSign';
import { StakingDataType } from 'hooks/types';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, View } from 'react-native';
import { HomeNavigationProps } from 'routes/home';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { restartCronAndSubscriptionServices } from '../../../../messaging';
import { useRefresh } from 'hooks/useRefresh';
import useGetStakingList from 'hooks/screen/Home/Staking/useGetStakingList';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { Button } from 'components/design-system-ui';
import { StakingDetailModal } from 'screens/Home/Staking/StakingDetail/StakingDetailModal';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';
import { Header } from 'components/Header';
import { ScreenContainer } from 'components/ScreenContainer';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';

enum FilterValue {
  NOMINATED = 'nominated',
  POOLED = 'pooled',
}

const FILTER_OPTIONS = [
  { label: 'Nominated', value: FilterValue.NOMINATED },
  { label: 'Pooled', value: FilterValue.POOLED },
];

const renderEmpty = (val?: string) => {
  if (val) {
    return <EmptyStaking message={i18n.stakingScreen.balanceList.stakingAppearHere} />;
  } else {
    return <EmptyStaking />;
  }
};

const filterFunction = (items: StakingDataType[], filters: string[]) => {
  const filteredChainList: StakingDataType[] = [];

  items.forEach(item => {
    let isValidationPassed = true;

    for (const filter of filters) {
      switch (filter) {
        case FilterValue.NOMINATED:
          isValidationPassed = isValidationPassed && item.staking.type === StakingType.NOMINATED;
          break;
        case FilterValue.POOLED:
          isValidationPassed = isValidationPassed && item.staking.type === StakingType.POOLED;
          break;
        default:
          isValidationPassed = false;
          break;
      }
    }

    if (isValidationPassed) {
      filteredChainList.push(item);
    }
  });

  return filteredChainList;
};

const filteredFunction = (items: StakingDataType[], searchString: string) => {
  return items.filter(({ staking }) => {
    return staking.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase());
  });
};

const StakingBalanceList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { data, priceMap } = useGetStakingList();
  const isCanSign = useCurrentAccountCanSign();
  const stakingNavigation = useNavigation<StakingScreenNavigationProps>();
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

  const handlePressStartStaking = useCallback(() => {
    stakingNavigation.navigate('Stake', {});
  }, [stakingNavigation]);

  const rightIconOption = useMemo(() => {
    if (!isCanSign) {
      return undefined;
    }

    return {
      icon: Plus,
      onPress: handlePressStartStaking,
    };
  }, [handlePressStartStaking, isCanSign]);

  return (
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <Header />
        <FlatListScreen
          title={i18n.title.staking}
          items={data}
          showLeftBtn={false}
          autoFocus={false}
          renderListEmptyComponent={renderEmpty}
          searchFunction={filteredFunction}
          filterOptions={FILTER_OPTIONS}
          filterFunction={filterFunction}
          renderItem={renderItem}
          rightIconOption={rightIconOption}
          // afterListItem={
          //   isCanSign ? (
          //     <View style={{ ...MarginBottomForSubmitButton, ...ContainerHorizontalPadding, paddingTop: 16 }}>
          //       <Button onPress={handlePressStartStaking}>{i18n.stakingScreen.startStaking}</Button>
          //     </View>
          //   ) : undefined
          // }
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
