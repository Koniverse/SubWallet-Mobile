import React from 'react';
import { SwModal, Number } from 'components/design-system-ui';
import { Text, View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { AmountData, ChainStakingMetadata, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getUnstakingPeriod } from 'screens/Transaction/helper/staking';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';

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
    expectedReturn,
    inflation,
    unstakingPeriod,
  } = chainStakingMetadata;
  const theme = useSubWalletTheme().swThemes;
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

              {!!activeNominators && (
                <MetaInfo.Number label={'Total nominators'} value={activeNominators} decimals={0} />
              )}
            </>
          )}

          {!!expectedReturn && !!inflation && (
            <MetaInfo.Default label={'Estimated earning'}>
              {() => (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 210 }}>
                  <Number
                    value={expectedReturn}
                    decimal={0}
                    suffix={'%'}
                    size={14}
                    textStyle={{
                      ...FontMedium,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize,
                      lineHeight: theme.fontSize * theme.lineHeight,
                      ...FontMedium,
                      color: theme.colorWhite,
                    }}>
                    {' '}
                    /{' '}
                  </Text>
                  <Number
                    value={inflation}
                    decimal={0}
                    suffix={'%'}
                    size={14}
                    textStyle={{
                      ...FontMedium,
                      color: theme.colorTextTertiary,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: theme.fontSize,
                      lineHeight: theme.fontSize * theme.lineHeight,
                      ...FontMedium,
                      color: theme.colorTextTertiary,
                    }}>
                    {' after inflation'}
                  </Text>
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
            <MetaInfo.Default valueColorSchema={'light'} label={'Unstaking period'}>{getUnstakingPeriod(unstakingPeriod)}</MetaInfo.Default>
          )}
        </MetaInfo>
      </View>
    </SwModal>
  );
};
