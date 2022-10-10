import { useNavigation } from '@react-navigation/native';
import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ArrowsDownUp } from 'phosphor-react-native';
import React, { useCallback, useEffect, useReducer } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import {
  DEFAULT_VALIDATOR_LIST_STATE,
  ValidatorListActionName,
  validatorListReducer,
} from 'reducers/staking/validatorList';
import { HomeNavigationProps } from 'routes/home';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import SortValidatorModal from 'screens/Home/Staking/Validator/SortValidatorModal';
import StakingValidatorItem from 'screens/Home/Staking/Validator/StakingValidatorItem';
import { RootState } from 'stores/index';
import { ValidatorSortBy } from 'types/staking';
import i18n from 'utils/i18n/i18n';
import { getBondingOptions } from '../../../../messaging';
import { StakingValidatorsProps } from 'routes/staking/stakingScreen';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
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

const StakingValidatorList = ({
  route: {
    params: { networkKey },
  },
  navigation: { goBack },
}: StakingValidatorsProps) => {
  const navigation = useNavigation<HomeNavigationProps>();

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const network = useGetNetworkJson(networkKey);

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

  const onPress = useCallback(
    (val: ValidatorInfo) => {
      return () => {
        navigation.navigate('Staking', {
          screen: 'StakingValidatorDetail',
          params: {
            networkKey: networkKey,
            networkValidatorsInfo: networkValidatorsInfo,
            validatorInfo: val,
          },
        });
      };
    },
    [navigation, networkKey, networkValidatorsInfo],
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
    getBondingOptions(networkKey, currentAccountAddress)
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
  }, [currentAccountAddress, networkKey]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={network.chain}
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
