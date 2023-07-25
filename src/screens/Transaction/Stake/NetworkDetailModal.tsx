import React, { useRef } from 'react';
import { SwModal, Number } from 'components/design-system-ui';
import { Text, View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { AmountData, ChainStakingMetadata, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getUnstakingPeriod } from 'screens/Transaction/helper/staking';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  modalVisible: boolean;
  stakingType: StakingType;
  chainStakingMetadata: ChainStakingMetadata;
  minimumActive: AmountData;
  setVisible: (arg: boolean) => void;
}

export const NetworkDetailModal = ({
  modalVisible,
  chainStakingMetadata,
  stakingType,
  minimumActive,
  setVisible,
}: Props) => {
  const {
    maxValidatorPerNominator,
    nominatorCount: activeNominators,
    expectedReturn,
    inflation,
    unstakingPeriod,
  } = chainStakingMetadata;
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onCloseModal = () => modalBaseV2Ref?.current?.close();
  return (
    <SwModal
      isUseModalV2
      setVisible={setVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      modalVisible={modalVisible}
      modalTitle={i18n.header.networkDetails}
      onBackButtonPress={onCloseModal}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          {stakingType === StakingType.NOMINATED && (
            <>
              <MetaInfo.Number
                label={i18n.inputLabel.maxNomination}
                value={maxValidatorPerNominator}
                valueColorSchema={'even-odd'}
              />

              {!!activeNominators && (
                <MetaInfo.Number label={i18n.inputLabel.totalNominators} value={activeNominators} decimals={0} />
              )}
            </>
          )}

          {!!expectedReturn && !!inflation && (
            <MetaInfo.Default label={i18n.inputLabel.estimatedEarnings}>
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
                    value={new BigN(expectedReturn).minus(inflation)}
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
                    {` ${i18n.stakingScreen.afterInflation}`}
                  </Text>
                </View>
              )}
            </MetaInfo.Default>
          )}

          <MetaInfo.Number
            decimals={minimumActive.decimals}
            label={i18n.inputLabel.minimumActive}
            suffix={minimumActive.symbol}
            value={minimumActive.value}
            valueColorSchema={'success'}
          />

          {!!unstakingPeriod && (
            <MetaInfo.Default valueColorSchema={'light'} label={i18n.inputLabel.unstakingPeriod}>
              {getUnstakingPeriod(unstakingPeriod)}
            </MetaInfo.Default>
          )}
        </MetaInfo>
      </View>
    </SwModal>
  );
};
