import React from 'react';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';

interface Props {
  detailModalVisible: boolean;
  detailItem: ValidatorDataType;
  onCancel: () => void;
}

export const ValidatorSelectorDetailModal = ({ detailItem, detailModalVisible, onCancel }: Props) => {
  const {
    address: validatorAddress,
    commission,
    decimals,
    expectedReturn: earningEstimated = '',
    identity: validatorName = '',
    minBond: minStake,
    otherStake,
    ownStake,
    symbol,
    totalStake,
  } = detailItem;

  return (
    <SwModal modalVisible={detailModalVisible} modalTitle={'Validator details'} onChangeModalVisible={onCancel}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account label={'Validator'} address={validatorAddress} name={validatorName} />
          <MetaInfo.Number
            decimals={decimals}
            label={'Min stake'}
            suffix={symbol}
            value={minStake}
            valueColorSchema={'even-odd'}
          />
          {totalStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={'Total stake'}
              suffix={symbol}
              value={totalStake}
              valueColorSchema={'even-odd'}
            />
          )}

          {ownStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={'Own stake'}
              suffix={symbol}
              value={ownStake}
              valueColorSchema={'even-odd'}
            />
          )}
          {otherStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={'Other stake'}
              suffix={symbol}
              value={otherStake}
              valueColorSchema={'even-odd'}
            />
          )}

          {earningEstimated > 0 && earningEstimated !== '' && (
            <MetaInfo.Number
              label={'Earning estimated'}
              suffix={'%'}
              value={earningEstimated}
              valueColorSchema={'even-odd'}
            />
          )}
          <MetaInfo.Number label={'Commission'} suffix={'%'} value={commission} valueColorSchema={'even-odd'} />
        </MetaInfo>
      </View>
    </SwModal>
  );
};
