import React from 'react';
import { SwModal, Number } from 'components/design-system-ui';
import { Text, View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { AmountData, ChainStakingMetadata, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getUnstakingPeriod } from 'screens/Transaction/helper/staking';

interface Props {
  modalVisible: boolean;
  stakingType: StakingType;
  chainStakingMetadata: ChainStakingMetadata;
  minimumActive: AmountData;
  onCloseModal?: () => void;
}

export const NetworkDetailModal = ({
  modalVisible,
  chainStakingMetadata,
  stakingType,
  minimumActive,
  onCloseModal,
}: Props) => {
  const {
    maxValidatorPerNominator,
    nominatorCount: activeNominators,
    estimatedEarning,
    inflation,
    unstakingPeriod,
  } = chainStakingMetadata;
  return (
    <SwModal modalVisible={modalVisible} modalTitle={'Network details'} onChangeModalVisible={onCloseModal}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          {stakingType === StakingType.NOMINATED && (
            <>
              <MetaInfo.Number
                label={'Max nomination'}
                value={maxValidatorPerNominator}
                valueColorSchema={'even-odd'}
              />

              {activeNominators && <MetaInfo.Number label={'Total nominators'} value={activeNominators} decimals={0} />}
            </>
          )}

          {!!estimatedEarning && !!inflation && (
            <MetaInfo.Default label={'Estimated earning'}>
              {() => (
                <View style={{ flexDirection: 'row' }}>
                  <Number value={estimatedEarning} decimal={0} suffix={'%'} />
                  <Text>/</Text>
                  <Number value={inflation} decimal={0} suffix={'%'} />
                  <Text>{'after inflation'}</Text>
                </View>
              )}
            </MetaInfo.Default>
          )}

          <MetaInfo.Number
            decimals={minimumActive.decimals}
            label={'Minimum active'}
            suffix={minimumActive.symbol}
            value={minimumActive.value}
            valueColorSchema={'success'}
          />

          {!!unstakingPeriod && (
            <MetaInfo.Default label={'Unstaking period'}>{getUnstakingPeriod(unstakingPeriod)}</MetaInfo.Default>
          )}
        </MetaInfo>
      </View>
    </SwModal>
  );
};
