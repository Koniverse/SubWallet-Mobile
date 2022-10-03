import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ArrowsDownUp } from 'phosphor-react-native';
import React, { Dispatch, useCallback, useEffect, useMemo, useReducer } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { StakingScreenActionParams, StakingScreenActionType, StakingScreenState } from 'reducers/staking/stakingScreen';
import {
  DEFAULT_VALIDATOR_LIST_STATE,
  ValidatorListActionName,
  validatorListReducer,
} from 'reducers/staking/validatorList';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import SortValidatorModal from 'screens/Home/Staking/Validator/SortValidatorModal';
import StakingValidatorItem from 'screens/Home/Staking/Validator/StakingValidatorItem';
import { RootState } from 'stores/index';
import { ValidatorSortBy } from 'types/staking';
import i18n from 'utils/i18n/i18n';
import { getBondingOptions } from '../../../../messaging';

interface Props {
  stakingState: StakingScreenState;
  dispatchStakingState: Dispatch<StakingScreenActionParams>;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  paddingBottom: 16,
};

const filterFunction = (items: ValidatorInfo[], searchString: string): ValidatorInfo[] => {
  return items.filter(item => {
    return (
      item.identity?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.address.toLowerCase().includes(searchString.toLowerCase())
    );
  });
};

const renderListEmptyComponent = (): JSX.Element => {
  return <EmptyStaking />;
};

const StakingValidatorList = ({ stakingState, dispatchStakingState }: Props) => {
  const selectedNetwork = useMemo((): string => stakingState.selectedNetwork || '', [stakingState.selectedNetwork]);

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const network = useGetNetworkJson(selectedNetwork);

  const [validatorListState, dispatchValidatorListState] = useReducer(validatorListReducer, {
    ...DEFAULT_VALIDATOR_LIST_STATE,
  });

  const { networkValidatorsInfo, validators, visible, loading, sortFunction } = validatorListState;

  const setVisible = useCallback((val: boolean) => {
    dispatchValidatorListState({ type: ValidatorListActionName.CHANGE_VISIBLE, payload: { visible: val } });
  }, []);

  const openModal = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onChangeSortBy = useCallback((val: ValidatorSortBy) => {
    return () => {
      dispatchValidatorListState({
        type: ValidatorListActionName.CHANGE_SORT_BY,
        payload: {
          sortBy: val,
        },
      });
    };
  }, []);

  const goBack = useCallback(() => {
    dispatchStakingState({ type: StakingScreenActionType.GO_BACK, payload: null });
  }, [dispatchStakingState]);

  const onPress = useCallback(
    (val: ValidatorInfo) => {
      return () => {
        dispatchStakingState({
          type: StakingScreenActionType.OPEN_VALIDATOR_DETAIL,
          payload: {
            selectedValidator: {
              validatorInfo: val,
              networkValidatorsInfo: networkValidatorsInfo,
            },
          },
        });
      };
    },
    [dispatchStakingState, networkValidatorsInfo],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ValidatorInfo>) => {
      return (
        <StakingValidatorItem
          networkValidatorsInfo={networkValidatorsInfo}
          key={item.address}
          data={item}
          onPress={onPress}
          network={network}
        />
      );
    },
    [network, networkValidatorsInfo, onPress],
  );

  useEffect(() => {
    let mount = true;
    dispatchValidatorListState({ type: ValidatorListActionName.CHANGE_LOADING, payload: { loading: true } });
    getBondingOptions(selectedNetwork, currentAccountAddress)
      .then(bondingOptionInfo => {
        if (mount) {
          dispatchValidatorListState({
            type: ValidatorListActionName.INIT,
            payload: {
              networkValidatorsInfo: {
                maxNominatorPerValidator: bondingOptionInfo.maxNominatorPerValidator,
                isBondedBefore: bondingOptionInfo.isBondedBefore,
                bondedValidators: bondingOptionInfo.bondedValidators,
                maxNominations: bondingOptionInfo.maxNominations,
              },
              validators: [...bondingOptionInfo.validators],
              loading: true,
              sortBy: 'Default',
              visible: false,
            },
          });

          setTimeout(() => {
            if (mount) {
              dispatchValidatorListState({ type: ValidatorListActionName.CHANGE_LOADING, payload: { loading: false } });
            }
          }, 500);
        }
      })
      .catch(console.error);

    return () => {
      mount = false;
    };
  }, [currentAccountAddress, selectedNetwork]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={goBack}
      title={stakingState.title}
      rightIcon={ArrowsDownUp}
      onPressRightIcon={openModal}>
      <>
        <View style={WrapperStyle}>
          <FlatListScreen
            items={validators}
            withSubHeader={false}
            autoFocus={false}
            renderListEmptyComponent={renderListEmptyComponent}
            renderItem={renderItem}
            loading={loading}
            filterFunction={filterFunction}
            placeholder={i18n.stakingScreen.validatorList.searchValidator}
            sortFunction={sortFunction}
          />
        </View>
        <SortValidatorModal visible={visible} closeModal={closeModal} onPress={onChangeSortBy} />
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakingValidatorList);
