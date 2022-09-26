import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useSelector } from 'react-redux';
import {
  STAKING_INITIAL_STATE,
  stakingReducer,
  StakingScreenActionType,
  StakingScreenName,
} from 'reducers/stakingScreen';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import StakingNetworkList from 'screens/Home/Staking/Network/StakingNetworkList';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import useFetchStaking from 'hooks/screen/Home/Staking/useFetchStaking';
import { Plus } from 'phosphor-react-native';
import StakingDetail from 'screens/Home/Staking/StakingDetail/StakingDetail';
import { RootState } from 'stores/index';
import StakingValidatorList from './Validator/StakingValidatorList';
import { ScreenCanStaking, ScreenNonHeader } from 'constants/stakingScreen';

const EMPTY_STAKING = <EmptyStaking />;


export const StakingScreen = () => {
  const isAllAccount = useIsAccountAll();
  const {
    data: stakingData,
    loading: loadingStaking,
    priceMap: stakingPriceMap,
    stakeUnlockingTimestamp,
  } = useFetchStaking();

  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const [stakingState, dispatchStakingState] = useReducer(stakingReducer, { ...STAKING_INITIAL_STATE });

  const goBack = useCallback(() => {
    dispatchStakingState({ type: StakingScreenActionType.GO_BACK, payload: null });
  }, []);

  const handlePressStaking = useCallback(() => {
    if (stakingState.screen === 'StakingDetail' && stakingState.stakingKey) {
      dispatchStakingState({
        type: StakingScreenActionType.START_STAKING,
        payload: {
          selectedNetwork: stakingState.stakingKey,
          title: networkMap[stakingState.stakingKey].chain,
        },
      });
    } else {
      dispatchStakingState({ type: StakingScreenActionType.START_STAKING, payload: null });
    }
  }, [stakingState.screen, stakingState.stakingKey, networkMap]);

  const stakingContent = useCallback((): JSX.Element => {
    switch (stakingState.screen) {
      case 'StakingList':
        return (
          <StakingBalanceList
            data={stakingData}
            priceMap={stakingPriceMap}
            dispatchStakingState={dispatchStakingState}
          />
        );
      case 'StakingDetail':
        if (stakingState.stakingKey) {
          return <StakingDetail priceMap={stakingPriceMap} stakingState={stakingState} stakingData={stakingData} />;
        } else {
          dispatchStakingState({ type: StakingScreenActionType.OPEN_STAKING_LIST, payload: null });
          return EMPTY_STAKING;
        }
      case 'NetworkList':
        return <StakingNetworkList dispatchStakingState={dispatchStakingState} />;
      case 'ValidatorList':
        if (stakingState.selectedNetwork) {
          return <StakingValidatorList stakingState={stakingState} dispatchStakingState={dispatchStakingState} />;
        } else {
          dispatchStakingState({ type: StakingScreenActionType.START_STAKING, payload: null });
          return EMPTY_STAKING;
        }
      //   case 'Collection':
      //     if (nftState.collection) {
      //       return <NftItemList dispatchNftState={dispatchNftState} nftState={nftState} />;
      //     } else {
      //       dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
      //       return EMPTY_NFT;
      //     }
      //
      //   case 'NFT':
      //     if (nftState.collection && nftState.nft) {
      //       return <NftDetail nftState={nftState} />;
      //     } else {
      //       dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
      //       return EMPTY_NFT;
      //     }
      //
      //   default:
      //     dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
      //     return EMPTY_NFT;
    }
    return EMPTY_STAKING;
  }, [stakingData, stakingPriceMap, stakingState]);

  if (ScreenNonHeader.includes(stakingState.screen)) {
    return stakingContent();
  }

  return (
    <ContainerWithSubHeader
      showLeftBtn={stakingState.screen !== 'StakingList'}
      onPressBack={goBack}
      title={stakingState.title}
      // style={ContainerHeaderStyle}
      rightIcon={isAllAccount ? undefined : ScreenCanStaking.includes(stakingState.screen) ? Plus : undefined}
      onPressRightIcon={
        isAllAccount ? undefined : ScreenCanStaking.includes(stakingState.screen) ? handlePressStaking : undefined
      }
      // isShowPlaceHolder={false}
    >
      {stakingContent()}
    </ContainerWithSubHeader>
  );
};
