import { useNavigation } from '@react-navigation/native';
import { ChainBondingBasics, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetStakingNetworks from 'hooks/screen/Home/Staking/useGetStakingNetworks';
import React, { useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import StakingNetworkItem from 'screens/Home/Staking/Network/StakingNetworkItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import i18n from 'utils/i18n/i18n';
import { getChainBondingBasics } from '../../../../messaging';
import { HomeNavigationProps } from 'routes/home';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
};

const renderEmpty = () => {
  return <EmptyStaking />;
};

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(item =>
    item.chain.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()),
  );
};

const StakingNetworkList = () => {
  const navigation = useNavigation<HomeNavigationProps>();

  const stakingNetworks = useGetStakingNetworks();
  const [chainBondingBasics, setChainBondingBasics] = useState<Record<string, ChainBondingBasics>>({});
  const [loading, setLoading] = useState(true);

  const handlePress = useCallback(
    (network: NetworkJson): (() => void) => {
      return () => {
        navigation.navigate('Staking', {
          screen: 'StakingValidators',
          params: {
            networkKey: network.key,
          },
        });
      };
    },
    [navigation],
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
          if (needUpdate) {
            if (needUpdate) {
              setChainBondingBasics(data);
              setLoading(false);
            }
          }
        })
        .catch((e: Error) => {
          console.log(e);
          if (needUpdate) {
            setLoading(false);
          }
        });
    }

    return () => {
      needUpdate = false;
    };
  }, [stakingNetworks]);

  const goBack = useCallback(() => {
    navigation.navigate('Staking', {
      screen: 'StakingBalances',
    });
  }, [navigation]);

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.stakingNetwork}>
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
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingNetworkList);
