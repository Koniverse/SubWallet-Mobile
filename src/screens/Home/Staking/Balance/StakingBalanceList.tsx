import { useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import useCurrentAccountCanSign from 'hooks/screen/useCurrentAccountCanSign';
import { StakingDataType } from 'hooks/types';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, SafeAreaView, View } from 'react-native';
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
import StakingActionModal from "screens/Home/Staking/StakingDetail/StakingActionModal";

const renderEmpty = (val?: string) => {
  if (val) {
    return <EmptyStaking message={i18n.stakingScreen.balanceList.stakingAppearHere} />;
  } else {
    return <EmptyStaking />;
  }
};

const filteredFunction = (items: StakingDataType[], searchString: string) => {
  return items.filter(({ staking }) => {
    return staking.name.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase());
  });
};

const StakingBalanceList = () => {
  const { data, priceMap } = useGetStakingList();
  const isCanSign = useCurrentAccountCanSign();
  const navigation = useNavigation<HomeNavigationProps>();
  const stakingNavigation = useNavigation<StakingScreenNavigationProps>();
  const [isRefresh, refresh] = useRefresh();
  const [selectedItem, setSelectedItem] = useState<StakingDataType | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [moreActionModalVisible, setMoreActionModalVisible] = useState<boolean>(false);

  const handleOnPress = useCallback(
    (stakingData: StakingDataType): (() => void) => {
      return () => {
        setSelectedItem(stakingData);
        setDetailModalVisible(true);
      };
    },
    [navigation],
  );

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
    <>
      <FlatListScreen
        title={i18n.title.staking}
        items={data}
        showLeftBtn={false}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        searchFunction={filteredFunction}
        renderItem={renderItem}
        rightIconOption={rightIconOption}
        afterListItem={
          isCanSign ? (
            <View style={{ ...MarginBottomForSubmitButton, ...ContainerHorizontalPadding, paddingTop: 16 }}>
              <Button onPress={handlePressStartStaking}>{i18n.stakingScreen.startStaking}</Button>
            </View>
          ) : undefined
        }
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

      <SafeAreaView />
    </>
  );
};

export default React.memo(StakingBalanceList);
