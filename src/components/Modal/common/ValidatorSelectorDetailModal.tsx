import React from 'react';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';
import i18n from 'utils/i18n/i18n';

interface Props {
  detailModalVisible: boolean;
  detailItem: ValidatorDataType;
  onCancel: () => void;
  networkPrefix?: number;
}

export const ValidatorSelectorDetailModal = ({ detailItem, detailModalVisible, onCancel, networkPrefix }: Props) => {
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
    <SwModal
      modalVisible={detailModalVisible}
      modalTitle={i18n.header.validatorDetails}
      onBackButtonPress={onCancel}
      onChangeModalVisible={onCancel}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account
            label={i18n.inputLabel.validator}
            address={validatorAddress}
            name={validatorName}
            networkPrefix={networkPrefix}
          />
          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.minStakeRequire}
            suffix={symbol}
            value={minStake}
            valueColorSchema={'even-odd'}
          />
          {totalStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={i18n.inputLabel.totalStake}
              suffix={symbol}
              value={totalStake}
              valueColorSchema={'even-odd'}
            />
          )}

          {ownStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={i18n.inputLabel.ownStake}
              suffix={symbol}
              value={ownStake}
              valueColorSchema={'even-odd'}
            />
          )}
          {otherStake !== '0' && (
            <MetaInfo.Number
              decimals={decimals}
              label={i18n.inputLabel.stakeFromOthers}
              suffix={symbol}
              value={otherStake}
              valueColorSchema={'even-odd'}
            />
          )}

          {earningEstimated > 0 && earningEstimated !== '' && (
            <MetaInfo.Number
              label={i18n.inputLabel.estimatedApy}
              suffix={'%'}
              value={earningEstimated}
              valueColorSchema={'even-odd'}
            />
          )}
          <MetaInfo.Number
            label={i18n.inputLabel.commission}
            suffix={'%'}
            value={commission}
            valueColorSchema={'even-odd'}
          />
        </MetaInfo>
      </View>
    </SwModal>
  );
};
