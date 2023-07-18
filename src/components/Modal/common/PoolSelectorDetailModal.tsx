import React from 'react';
import { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import i18n from 'utils/i18n/i18n';

interface Props {
  detailModalVisible: boolean;
  detailItem: NominationPoolDataType;
  onCancel: () => void;
}

export const PoolSelectorDetailModal = ({ detailModalVisible, detailItem, onCancel }: Props) => {
  const { address = '', bondedAmount, memberCounter = 0, name, state, symbol, decimals } = detailItem;
  const stakingStatusUi = StakingStatusUi();
  return (
    <SwModal
      modalVisible={detailModalVisible}
      modalTitle={i18n.header.poolDetails}
      onChangeModalVisible={onCancel}
      onBackButtonPress={onCancel}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account address={address} name={name} label={i18n.inputLabel.pool} />
          <MetaInfo.Status
            statusName={state || ''}
            label={i18n.inputLabel.status}
            statusIcon={stakingStatusUi.active.icon}
            valueColorSchema={stakingStatusUi.active.schema}
          />

          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.totalBonded}
            suffix={symbol}
            value={bondedAmount || '0'}
          />

          <MetaInfo.Number label={i18n.inputLabel.totalMembers} value={memberCounter} />
        </MetaInfo>
      </View>
    </SwModal>
  );
};
