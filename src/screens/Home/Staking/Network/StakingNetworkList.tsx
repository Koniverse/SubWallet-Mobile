import { useNavigation } from '@react-navigation/native';
import { ChainBondingBasics, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetStakingNetworks from 'hooks/screen/Home/Staking/useGetStakingNetworks';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import StakingNetworkItem from 'screens/Home/Staking/Network/StakingNetworkItem';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import i18n from 'utils/i18n/i18n';
import { getChainBondingBasics } from '../../../../messaging';
import { WebRunnerContext } from 'providers/contexts';
import { NoInternetScreen } from 'components/NoInternetScreen';

const renderEmpty = (val?: string) => {
  if (val) {
    return <EmptyStaking message={i18n.stakingScreen.networkList.noChainAvailable} />;
  } else {
    return <EmptyStaking message={i18n.stakingScreen.networkList.chainAppearHere} />;
  }
};

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(item =>
    item.chain.replace(' Relay Chain', '').toLowerCase().includes(searchString.toLowerCase()),
  );
};

const StakingNetworkList = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const goHome = useGoHome({ screen: 'Staking', params: { screen: 'StakingBalances' } });
  useHandleGoHome({ goHome: goHome, networkFocusRedirect: true });

  const stakingNetworks = useGetStakingNetworks();
  const [chainBondingBasics, setChainBondingBasics] = useState<Record<string, ChainBondingBasics>>({});
  const [loading, setLoading] = useState(true);

  const renderNoInternetConnectedScreen = () => {
    return <NoInternetScreen />;
  };

  const handlePress = useCallback(
    (network: NetworkJson): (() => void) => {
      return () => {
        navigation.navigate('Home', {
          screen: 'Staking',
          params: {
            screen: 'StakingValidators',
            params: {
              networkKey: network.key,
            },
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
        if (needUpdate) {
          setChainBondingBasics(data);
          setLoading(false);
        }
      })
        .then(data => {
          if (needUpdate) {
            setChainBondingBasics(data);
            setLoading(false);
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

  return (
    <FlatListScreen
      title={i18n.title.stakingNetwork}
      onPressBack={navigation.goBack}
      items={stakingNetworks}
      autoFocus={false}
      renderListEmptyComponent={isNetConnected ? renderEmpty : renderNoInternetConnectedScreen}
      renderItem={renderItem}
      loading={loading}
      filterFunction={filterFunction}
      placeholder={'Search network...'}
      isNetConnected={isNetConnected}
    />
  );
};

export default React.memo(StakingNetworkList);
