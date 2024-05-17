import React, { useCallback, useMemo, useRef } from 'react';
import { SwModal, Number, Typography } from 'components/design-system-ui';
import { View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { getSchemaColor } from 'components/MetaInfo/shared';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  detailModalVisible: boolean;
  detailItem: ValidatorDataType;
  networkPrefix?: number;
  setVisible: (arg: boolean) => void;
  chain: string;
  maxPoolMembersValue?: number;
}

export const ValidatorSelectorDetailModal = ({
  detailItem,
  detailModalVisible,
  networkPrefix,
  setVisible,
  chain,
  maxPoolMembersValue,
}: Props) => {
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
    nominatorCount,
  } = detailItem;

  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onCancel = useCallback(() => modalBaseV2Ref?.current?.close(), []);
  const theme = useSubWalletTheme().swThemes;

  const isRelayChain = useMemo(() => {
    return _STAKING_CHAIN_GROUP.relay.includes(chain);
  }, [chain]);

  const isParaChain = useMemo(() => {
    return _STAKING_CHAIN_GROUP.para.includes(chain) || _STAKING_CHAIN_GROUP.amplitude.includes(chain);
  }, [chain]);

  const ratePercent = useMemo(() => {
    const rate = maxPoolMembersValue && nominatorCount / maxPoolMembersValue;

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
  }, [maxPoolMembersValue, nominatorCount]);

  return (
    <SwModal
      level={2}
      isUseModalV2
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setVisible}
      modalVisible={detailModalVisible}
      modalTitle={i18n.formatString(i18n.common.stakingValidatorDetail, getValidatorLabel(chain)) as string}
      onBackButtonPress={onCancel}>
      <View style={{ width: '100%' }}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account
            label={getValidatorLabel(chain)}
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

          {!maxPoolMembersValue && (isParaChain || isRelayChain) && (
            <MetaInfo.Number
              label={isParaChain ? 'Delegator' : 'Nominator'}
              value={nominatorCount}
              valueColorSchema={'even-odd'}
            />
          )}

          {!!maxPoolMembersValue && !!ratePercent && (isParaChain || isRelayChain) && (
            <MetaInfo.Default label={isParaChain ? 'Delegator' : 'Nominator'} labelAlign="top">
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Number decimal={0} value={nominatorCount} intColor={getSchemaColor(ratePercent, theme)} />
                <Typography.Text
                  size={'md'}
                  style={{ paddingHorizontal: theme.paddingXXS / 2, color: getSchemaColor(ratePercent, theme) }}>
                  {'/'}
                </Typography.Text>
                <Number decimal={0} value={maxPoolMembersValue} intColor={getSchemaColor(ratePercent, theme)} />
              </View>
            </MetaInfo.Default>
          )}
        </MetaInfo>
      </View>
    </SwModal>
  );
};
