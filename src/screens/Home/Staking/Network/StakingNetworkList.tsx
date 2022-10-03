import { ChainBondingBasics, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetStakingNetworks from 'hooks/screen/Home/Staking/useGetStakingNetworks';
import React, { Dispatch, useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { StakingScreenActionParams, StakingScreenActionType } from 'reducers/staking/stakingScreen';
import StakingNetworkItem from 'screens/Home/Staking/Network/StakingNetworkItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { getChainBondingBasics } from '../../../../messaging';

interface Props {
  dispatchStakingState: Dispatch<StakingScreenActionParams>;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  paddingBottom: 16,
};

const renderEmpty = () => {
  return <EmptyStaking />;
};

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(item => item.chain.toLowerCase().includes(searchString.toLowerCase()));
};

const StakingNetworkList = ({ dispatchStakingState }: Props) => {
  const stakingNetworks = useGetStakingNetworks();
  const [chainBondingBasics, setChainBondingBasics] = useState<Record<string, ChainBondingBasics>>({});
  const [loading, setLoading] = useState(true);

  const handlePress = useCallback(
    (network: NetworkJson): (() => void) => {
      return () => {
        dispatchStakingState({
          type: StakingScreenActionType.OPEN_VALIDATOR_LIST,
          payload: { selectedNetwork: network.key, title: network.chain },
        });
      };
    },
    [dispatchStakingState],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NetworkJson>) => {
      const bondingMeta = chainBondingBasics[item.key];
      return <StakingNetworkItem key={item.key} network={item} bondingMeta={bondingMeta} onPress={handlePress} />;
    },
    [chainBondingBasics, handlePress],
  );

  useEffect(() => {
    let needUpdate = true;

    setLoading(true);
    if (needUpdate) {
      getChainBondingBasics(stakingNetworks, data => {
        setChainBondingBasics(data);
        setLoading(false);
      })
        .then(data => {
          setChainBondingBasics(data);
          setLoading(false);
        })
        .catch((e: Error) => {
          console.log(e);
          setLoading(false);
        });
    }

    return () => {
      needUpdate = false;
    };
  }, [stakingNetworks]);

  return (
    <View style={WrapperStyle}>
      <FlatListScreen
        withSubHeader={false}
        items={stakingNetworks}
        autoFocus={false}
        renderListEmptyComponent={renderEmpty}
        renderItem={renderItem}
        loading={loading}
        filterFunction={filterFunction}
        placeholder={'Search network...'}
      />
    </View>
  );
};

export default React.memo(StakingNetworkList);
