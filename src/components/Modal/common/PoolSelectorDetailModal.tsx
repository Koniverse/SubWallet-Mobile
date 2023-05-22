import React from 'react';
import { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { StakingStatusUi } from 'constants/stakingStatusUi';

interface Props {
  detailModalVisible: boolean;
  detailItem: NominationPoolDataType;
  onCancel: () => void;
}

export const PoolSelectorDetailModal = ({ detailModalVisible, detailItem, onCancel }: Props) => {
  const { address = '', bondedAmount, memberCounter = 0, name, state, symbol, decimals } = detailItem;
  return (
    <SwModal modalVisible={detailModalVisible} modalTitle={'Pooled details'} onChangeModalVisible={onCancel}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account address={address} name={name} label={'Pool'} />
          <MetaInfo.Status
            statusName={state || ''}
            label={'Status'}
            statusIcon={StakingStatusUi.active.icon}
            valueColorSchema={StakingStatusUi.active.schema}
          />

          <MetaInfo.Number decimals={decimals} label={'Total pooled'} suffix={symbol} value={bondedAmount || '0'} />

          <MetaInfo.Number label={'Total members'} value={memberCounter} />
        </MetaInfo>
      </View>
    </SwModal>
  );
};
