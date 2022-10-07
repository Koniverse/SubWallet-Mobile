import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FlatListScreen } from 'components/FlatListScreen';
import { SubmitButton } from 'components/SubmitButton';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import { StakingDataType } from 'hooks/types';
import { Plus } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { HomeNavigationProps } from 'routes/home';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { ContainerHorizontalPadding } from 'styles/sharedStyles';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  paddingBottom: 16,
};

const renderEmpty = () => {
  return <EmptyStaking />;
};

const filteredFunction = (items: StakingDataType[], searchString: string) => {
  return items.filter(({ staking }) => {
    return staking.name.replace('Relay Chain', '').toLowerCase().includes(searchString.toLowerCase());
  });
};

const StakingBalanceList = () => {
  const { data, loading, priceMap } = useFetchStaking();
  const isAllAccount = useIsAccountAll();

  const navigation = useNavigation<HomeNavigationProps>();

  const handleOnPress = useCallback(
    (stakingData: StakingDataType): (() => void) => {
      return () => {
        navigation.navigate('Staking', {
          screen: 'StakingBalanceDetail',
          params: {
            networkKey: stakingData.key,
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
          key={stakingData.staking.chainId}
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

  return (
    <ContainerWithSubHeader
      onPressBack={noop}
      showLeftBtn={false}
      title={i18n.title.staking}
      rightIcon={Plus}
      onPressRightIcon={handlePressStartStaking}>
      <View style={WrapperStyle}>
        <FlatListScreen
          withSubHeader={false}
          items={data}
          autoFocus={false}
          renderListEmptyComponent={renderEmpty}
          filterFunction={filteredFunction}
          renderItem={renderItem}
          loading={loading}
          afterListItem={
            !isAllAccount ? (
              <View style={{ ...ContainerHorizontalPadding, paddingTop: 16 }}>
                <SubmitButton title={i18n.stakingScreen.startStaking} onPress={handlePressStartStaking} />
              </View>
            ) : undefined
          }
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingBalanceList);
