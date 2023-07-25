import React, { useCallback, useRef } from 'react';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  detailModalVisible: boolean;
  detailItem: ValidatorDataType;
  networkPrefix?: number;
  setVisible: (arg: boolean) => void;
}

export const ValidatorSelectorDetailModal = ({ detailItem, detailModalVisible, networkPrefix, setVisible }: Props) => {
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

  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onCancel = useCallback(() => modalBaseV2Ref?.current?.close(), []);

  return (
    <SwModal
      level={2}
      isUseModalV2
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setVisible}
      modalVisible={detailModalVisible}
      modalTitle={i18n.header.validatorDetails}
      onBackButtonPress={onCancel}>
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
