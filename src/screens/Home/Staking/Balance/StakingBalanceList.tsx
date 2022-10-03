import { FlatListScreen } from 'components/FlatListScreen';
import { SubmitButton } from 'components/SubmitButton';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import { StakingDataType } from 'hooks/types';
import React, { Dispatch, useCallback } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { StakingScreenActionParams, StakingScreenActionType } from 'reducers/staking/stakingScreen';
import StakingBalanceItem from 'screens/Home/Staking/Balance/StakingBalanceItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: StakingDataType[];
  priceMap: Record<string, number>;
  dispatchStakingState: Dispatch<StakingScreenActionParams>;
  loading: boolean;
}

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

const StakingBalanceList = ({ data, priceMap, dispatchStakingState, loading }: Props) => {
  const isAllAccount = useIsAccountAll();

  const handleOnPress = useCallback(
    (stakingData: StakingDataType): (() => void) => {
      return () => {
        dispatchStakingState({
          type: StakingScreenActionType.OPEN_STAKING_DETAIL,
          payload: { stakingKey: stakingData.key },
        });
      };
    },
    [dispatchStakingState],
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
    dispatchStakingState({ type: StakingScreenActionType.START_STAKING, payload: null });
  }, [dispatchStakingState]);

  return (
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
  );
};

export default React.memo(StakingBalanceList);
