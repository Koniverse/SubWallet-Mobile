import React, { useCallback, useRef } from 'react';
import { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  detailModalVisible: boolean;
  detailItem: NominationPoolDataType;
  setVisible: (arg: boolean) => void;
}

export const PoolSelectorDetailModal = ({ detailModalVisible, detailItem, setVisible }: Props) => {
  const { address = '', bondedAmount, memberCounter = 0, name, state, symbol, decimals } = detailItem;
  const stakingStatusUi = StakingStatusUi();
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onCancel = useCallback(() => modalBaseV2Ref?.current?.close(), []);

  return (
    <SwModal
      level={2}
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setVisible}
      isUseModalV2
      modalVisible={detailModalVisible}
      modalTitle={i18n.header.poolDetails}
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
