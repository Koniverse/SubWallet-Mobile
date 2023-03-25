import { useNavigation } from '@react-navigation/native';
import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import useGetValidatorType from 'hooks/screen/Staking/useGetValidatorType';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { ArrowsDownUp } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { useSelector } from 'react-redux';
import {
  DEFAULT_VALIDATOR_LIST_STATE,
  ValidatorListActionName,
  validatorListReducer,
} from 'reducers/staking/validatorList';
import { RootNavigationProps } from 'routes/index';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import SortValidatorModal from 'screens/Home/Staking/Validator/SortValidatorModal';
import StakingValidatorItem from 'screens/Home/Staking/Validator/StakingValidatorItem';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ValidatorSortBy, ValidatorType } from 'types/staking';
import i18n from 'utils/i18n/i18n';
import { getBondingOptions } from '../../../../messaging';
import { StakingValidatorsProps } from 'routes/staking/stakingScreen';
import { WebRunnerContext } from 'providers/contexts';

const filterFunction = (items: ValidatorInfo[], searchString: string): ValidatorInfo[] => {
  return items.filter(item => {
    return (
      item.identity?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.address.toLowerCase().includes(searchString.toLowerCase())
    );
  });
};

const renderListEmptyComponent = (
  emptyMessage: string,
  noAvailableMessage: string,
): ((val?: string) => JSX.Element) => {
  return (val?: string) => {
    if (val) {
      return <EmptyStaking message={noAvailableMessage} />;
    } else {
      return <EmptyStaking message={emptyMessage} />;
    }
  };
};

const getRenderEmptyFunction = (type: ValidatorType): ((val?: string) => JSX.Element) => {
  switch (type) {
    case 'Collator':
      return renderListEmptyComponent(
        i18n.stakingScreen.validatorList.collatorAppearHere,
        i18n.stakingScreen.validatorList.noCollatorAvailable,
      );
    case 'DApp':
      return renderListEmptyComponent(
        i18n.stakingScreen.validatorList.dAppAppearHere,
        i18n.stakingScreen.validatorList.noDAppAvailable,
      );
    case 'Validator':
    case 'Unknown':
    default:
      return renderListEmptyComponent(
        i18n.stakingScreen.validatorList.validatorAppearHere,
        i18n.stakingScreen.validatorList.noValidatorAvailable,
      );
  }
};

const StakingValidatorList = ({
  route: {
    params: { networkKey },
  },
  navigation: { goBack },
}: StakingValidatorsProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const goHome = useGoHome({ screen: 'Staking', params: { screen: 'StakingBalances' } });
  useHandleGoHome({ goHome: goHome, networkKey: networkKey, networkFocusRedirect: false });

  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccountAddress);

  const network = useGetNetworkJson(networkKey);
  const validatorType = useGetValidatorType(networkKey);

  const headerTitle = useMemo((): string => {
    switch (validatorType) {
      case 'Validator':
        return i18n.title.validators;
      case 'Collator':
        return i18n.title.collators;
      case 'DApp':
        return i18n.title.dApps;
      case 'Unknown':
      default:
        return network.chain.replace(' Relay Chain', '');
    }
  }, [network.chain, validatorType]);

  const searchPlaceHolder = useMemo((): string => {
    switch (validatorType) {
      case 'Validator':
        return i18n.stakingScreen.validatorList.searchValidator;
      case 'Collator':
        return i18n.stakingScreen.validatorList.searchCollator;
      case 'DApp':
        return i18n.stakingScreen.validatorList.searchDApp;
      case 'Unknown':
      default:
        return i18n.common.search;
    }
  }, [validatorType]);

  const [validatorListState, dispatchValidatorListState] = useReducer(validatorListReducer, {
    ...DEFAULT_VALIDATOR_LIST_STATE,
  });

  const { networkValidatorsInfo, validators, visible, loading, sortFunction, sortBy } = validatorListState;

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
        navigation.navigate('Home', {
          screen: 'Staking',
          params: {
            screen: 'StakingValidatorDetail',
            params: {
              networkKey: networkKey,
              networkValidatorsInfo: networkValidatorsInfo,
              validatorInfo: val,
            },
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

  const handleEmptyList = useCallback(
    (val?: string): JSX.Element => {
      const func = getRenderEmptyFunction(validatorType);
      return func(val);
    },
    [validatorType],
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
    <>
      <FlatListScreen
        items={validators}
        autoFocus={false}
        renderListEmptyComponent={handleEmptyList}
        renderItem={renderItem}
        loading={loading}
        searchFunction={filterFunction}
        placeholder={searchPlaceHolder}
        sortFunction={sortFunction}
        onPressBack={goBack}
        title={headerTitle}
        rightIconOption={{
          icon: ArrowsDownUp,
          onPress: openModal,
          color: sortBy !== 'Default' ? ColorMap.primary : undefined,
        }}
        isNetConnected={isNetConnected}
      />
      <SortValidatorModal visible={visible} closeModal={closeModal} onPress={onChangeSortBy} sortBy={sortBy} />
    </>
  );
};

export default React.memo(StakingValidatorList);
