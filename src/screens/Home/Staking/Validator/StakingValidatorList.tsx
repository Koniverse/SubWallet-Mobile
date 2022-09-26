import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FlatListScreen } from 'components/FlatListScreen';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { Dispatch, useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { StakingScreenActionParams, StakingScreenActionType, StakingScreenState } from 'reducers/stakingScreen';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import SortValidatorModal from 'screens/Home/Staking/Validator/SortValidatorModal';
import StakingValidatorItem from 'screens/Home/Staking/Validator/StakingValidatorItem';
import { RootState } from 'stores/index';
import { NetworkValidatorsInfo, ValidatorSortBy } from 'types/staking';
import { defaultSortFunc } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { getBondingOptions } from '../../../../messaging';
import { ArrowsDownUp } from 'phosphor-react-native';

interface Props {
  stakingState: StakingScreenState;
  dispatchStakingState: Dispatch<StakingScreenActionParams>;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  paddingBottom: 16,
};

const sortByDefaultFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.isVerified && !_validator.isVerified) {
    return -1;
  } else if (!validator.isVerified && _validator.isVerified) {
    return 1;
  }

  return 0;
};

const sortByReturnedFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.expectedReturn > _validator.expectedReturn) {
    return -1;
  } else if (validator.expectedReturn <= _validator.expectedReturn) {
    return 1;
  }

  return 0;
};

const sortByCommissionFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.commission <= _validator.commission) {
    return -1;
  } else if (validator.commission > _validator.commission) {
    return 1;
  }

  return 0;
};

const filterFunction = (items: ValidatorInfo[], searchString: string) => {
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
  const selectedNetwork = stakingState.selectedNetwork as string;

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const network = useGetNetworkJson(selectedNetwork);

  const [networkValidatorsInfo, setNetworkValidatorsInfo] = useState<NetworkValidatorsInfo>({
    bondedValidators: [],
    isBondedBefore: false,
    maxNominatorPerValidator: 0,
    maxNominations: 0,
  });

  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);
  const [sortBy, setSortBy] = useState<ValidatorSortBy>('Default');

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const onChangeSortBy = useCallback((val: ValidatorSortBy) => {
    return () => {
      setSortBy(val);
      setVisible(false);
    };
  }, []);

  const goBack = useCallback(() => {
    dispatchStakingState({ type: StakingScreenActionType.GO_BACK, payload: null });
  }, [dispatchStakingState]);

  const sortFunction = useCallback(
    (a: ValidatorInfo, b: ValidatorInfo) => {
      switch (sortBy) {
        case 'Return':
          return sortByReturnedFunc(a, b);
        case 'Commission':
          return sortByCommissionFunc(a, b);
        case 'Default':
          return sortByDefaultFunc(a, b);
        default:
          return defaultSortFunc();
      }
    },
    [sortBy],
  );

  const onPress = useCallback((val: ValidatorInfo) => {
    return () => {};
  }, []);

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
    setLoading(true);
    getBondingOptions(selectedNetwork, currentAccountAddress)
      .then(bondingOptionInfo => {
        if (mount) {
          setNetworkValidatorsInfo({
            maxNominatorPerValidator: bondingOptionInfo.maxNominatorPerValidator,
            isBondedBefore: bondingOptionInfo.isBondedBefore,
            bondedValidators: bondingOptionInfo.bondedValidators,
            maxNominations: bondingOptionInfo.maxNominations,
          });
          setValidators([...bondingOptionInfo.validators]);
          setLoading(false);
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
