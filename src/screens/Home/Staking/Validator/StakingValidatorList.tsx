import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { Dispatch, useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { StakingScreenActionParams, StakingScreenState } from 'reducers/stakingScreen';
import EmptyStaking from 'screens/Home/Staking/Shared/EmptyStaking';
import { RootState } from 'stores/index';
import { getBondingOptions } from '../../../../messaging';

interface Props {
  stakingState: StakingScreenState;
  dispatchStakingState: Dispatch<StakingScreenActionParams>;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  paddingBottom: 16,
};

const StakingValidatorList = ({ stakingState, dispatchStakingState }: Props) => {
  const selectedNetwork = stakingState.selectedNetwork as string;
  const sortBy = stakingState.validatorSortBy;

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const network = useGetNetworkJson(selectedNetwork);

  useEffect(() => {
    getBondingOptions(selectedNetwork, currentAccountAddress)
      .then((bondingOptionInfo) => {
        setMaxNominatorPerValidator(bondingOptionInfo.maxNominatorPerValidator);
        setIsBondedBefore(bondingOptionInfo.isBondedBefore);
        setBondedValidators(bondingOptionInfo.bondedValidators);
        setMaxNominations(bondingOptionInfo.maxNominations);

        const sortedValidators = bondingOptionInfo.validators
          .sort((validator: ValidatorInfo, _validator: ValidatorInfo) => {
            if (validator.isVerified && !_validator.isVerified) {
              return -1;
            } else if (!validator.isVerified && _validator.isVerified) {
              return 1;
            }

            return 0;
          });

        setAllValidators(sortedValidators);
        setFilteredValidators(sortedValidators);
        setShowedValidators(sortedValidators.slice(0, sliceIndex + 1));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <View style={WrapperStyle}>
      <EmptyStaking />
    </View>
  );
};

export default React.memo(StakingValidatorList);
