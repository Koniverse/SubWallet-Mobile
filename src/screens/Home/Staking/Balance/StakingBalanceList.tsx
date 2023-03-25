import { useNavigation } from '@react-navigation/native';
import { FlatListScreen } from 'components/FlatListScreen';
import { SubmitButton } from 'components/SubmitButton';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import useCurrentAccountCanSign from 'hooks/screen/useCurrentAccountCanSign';
import { StakingDataType } from 'hooks/types';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { ListRenderItemInfo, RefreshControl, SafeAreaView, View } from 'react-native';
import { HomeNavigationProps } from 'routes/home';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ColorMap } from 'styles/color';
import { restartCronAndSubscriptionServices } from '../../../../messaging';
import { useRefresh } from 'hooks/useRefresh';

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
  const { data, loading, priceMap } = useFetchStaking();
  const isCanSign = useCurrentAccountCanSign();
  const navigation = useNavigation<HomeNavigationProps>();
  const [isRefresh, refresh] = useRefresh();

  const handleOnPress = useCallback(
    (stakingData: StakingDataType): (() => void) => {
      return () => {
        navigation.navigate('Staking', {
          screen: 'StakingBalanceDetail',
          params: {
            networkKey: stakingData.staking.chain,
            stakingType: stakingData.staking.type,
          },
        });
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
    navigation.navigate('Staking', {
      screen: 'StakingNetworks',
    });
  }, [navigation]);

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
        loading={loading}
        rightIconOption={rightIconOption}
        afterListItem={
          isCanSign ? (
            <View style={{ ...MarginBottomForSubmitButton, ...ContainerHorizontalPadding, paddingTop: 16 }}>
              <SubmitButton title={i18n.stakingScreen.startStaking} onPress={handlePressStartStaking} />
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

      <SafeAreaView />
    </>
  );
};

export default React.memo(StakingBalanceList);
