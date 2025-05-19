import React, { useCallback, useMemo, useRef } from 'react';

import { SwModal, Number, Typography } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { NominationPoolsEarningStatusUi, EarningStatusUi } from 'constants/stakingStatusUi';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getSchemaColor } from 'components/MetaInfo/shared';
import { NominationPoolDataType } from 'types/earning';
import { EarningStatus } from '@subwallet/extension-base/types';

interface Props {
  detailModalVisible: boolean;
  detailItem: NominationPoolDataType;
  setVisible: (arg: boolean) => void;
  maxPoolMembersValue?: number;
}

export const PoolSelectorDetailModal = ({ detailModalVisible, detailItem, setVisible, maxPoolMembersValue }: Props) => {
  const { address = '', bondedAmount, memberCounter = 0, name, state, symbol, decimals, isProfitable } = detailItem;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;

  const earningStatus: EarningStatus = useMemo(() => {
    return isProfitable ? EarningStatus.EARNING_REWARD : EarningStatus.NOT_EARNING;
  }, [isProfitable]);

  const ratePercent = useMemo(() => {
    const rate = maxPoolMembersValue && memberCounter / maxPoolMembersValue;

    if (rate !== undefined) {
      if (rate < 0.9) {
        return 'light';
      } else if (rate >= 0.9 && rate < 1) {
        return 'gold';
      } else {
        return 'danger';
      }
    }

    return undefined;
  }, [maxPoolMembersValue, memberCounter]);

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
            statusIcon={NominationPoolsEarningStatusUi[state].icon}
            valueColorSchema={NominationPoolsEarningStatusUi[state].schema}
          />
          <MetaInfo.Status
            label={i18n.inputLabel.stakingStatus}
            statusIcon={EarningStatusUi[earningStatus].icon}
            statusName={EarningStatusUi[earningStatus].name}
            valueColorSchema={EarningStatusUi[earningStatus].schema}
          />

          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.totalBonded}
            suffix={symbol}
            value={bondedAmount || '0'}
          />

          {!maxPoolMembersValue && (
            <MetaInfo.Number label={'Member'} value={memberCounter} valueColorSchema={'light'} />
          )}

          {!!maxPoolMembersValue && !!ratePercent && (
            <MetaInfo.Default label={'Member'}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Number size={14} decimal={0} value={memberCounter} intColor={getSchemaColor(ratePercent, theme)} />
                <Typography.Text
                  style={{ paddingHorizontal: theme.paddingXXS / 2, color: getSchemaColor(ratePercent, theme) }}>
                  {'/'}
                </Typography.Text>
                <Number
                  size={14}
                  decimal={0}
                  value={maxPoolMembersValue}
                  intColor={getSchemaColor(ratePercent, theme)}
                />
              </View>
            </MetaInfo.Default>
          )}
        </MetaInfo>
      </View>
    </SwModal>
  );
};
