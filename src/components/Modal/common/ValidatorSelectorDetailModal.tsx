import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SwModal, Number, Typography, Icon } from 'components/design-system-ui';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { getSchemaColor } from 'components/MetaInfo/shared';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ValidatorDataType } from 'types/earning';
import { RELAY_HANDLER_DIRECT_STAKING_CHAINS } from 'constants/chain';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Info } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

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
    isMissingInfo,
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
  const styles = createStyles(theme);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const isRelayChain = useMemo(() => {
    return RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(chain);
  }, [chain]);

  const isParaChain = useMemo(() => {
    return (
      _STAKING_CHAIN_GROUP.para.includes(chain) ||
      _STAKING_CHAIN_GROUP.amplitude.includes(chain) ||
      _STAKING_CHAIN_GROUP.energy.includes(chain)
    );
  }, [chain]);

  const isBittensorChain = useMemo(() => {
    return chain === 'bittensor' || chain === 'bittensor_testnet';
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
      isUseModalV2={false}
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setVisible}
      isUseForceHidden={false}
      modalVisible={detailModalVisible}
      onChangeModalVisible={() => setVisible(false)}
      modalTitle={i18n.formatString(i18n.common.stakingValidatorDetail, getValidatorLabel(chain)) as string}
      onBackButtonPress={onCancel}>
      <View style={styles.modalWrapper}>
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account
            label={getValidatorLabel(chain)}
            address={validatorAddress}
            name={validatorName}
            networkPrefix={networkPrefix}
          />
          {!isMissingInfo ? (
            <>
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
                  label={isBittensorChain ? 'Total stake weight' : i18n.inputLabel.totalStake}
                  suffix={symbol}
                  value={totalStake}
                  valueColorSchema={'even-odd'}
                />
              )}

              <MetaInfo.Number
                decimals={decimals}
                label={
                  isBittensorChain ? (
                    <Tooltip
                      isVisible={tooltipVisible}
                      disableShadow={true}
                      placement={'bottom'}
                      showChildInTooltip={false}
                      topAdjustment={
                        Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0
                      }
                      contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
                      closeOnBackgroundInteraction={true}
                      onClose={() => setTooltipVisible(false)}
                      content={
                        <Typography.Text size={'sm'} style={styles.tooltipTextStyle}>
                          {'Calculated as 18% of the root stake'}
                        </Typography.Text>
                      }>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}
                        onPress={() => setTooltipVisible(true)}>
                        <Typography.Text style={[styles.tooltipTextStyle, { ...FontSemiBold }]}>
                          {'Root weight'}
                        </Typography.Text>
                        <Icon phosphorIcon={Info} size="xs" type="phosphor" />
                      </TouchableOpacity>
                    </Tooltip>
                  ) : (
                    i18n.inputLabel.ownStake
                  )
                }
                suffix={symbol}
                value={ownStake}
                valueColorSchema={'even-odd'}
              />

              {otherStake !== '0' && (
                <MetaInfo.Number
                  decimals={decimals}
                  label={isBittensorChain ? 'Subnet stake' : i18n.inputLabel.stakeFromOthers}
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
            </>
          ) : (
            <MetaInfo.Text label={i18n.inputLabel.commission} value={'N/A'} />
          )}

          {!maxPoolMembersValue && (isParaChain || isRelayChain) && (
            <MetaInfo.Number
              label={isParaChain ? 'Delegator' : 'Nominator'}
              value={nominatorCount}
              valueColorSchema={'even-odd'}
            />
          )}

          {!!maxPoolMembersValue && !!ratePercent && (isParaChain || isRelayChain) && (
            <MetaInfo.Default label={isParaChain ? 'Delegator' : 'Nominator'} labelAlign="top">
              <View style={styles.maxPoolMemberArea}>
                <Number size={14} decimal={0} value={nominatorCount} intColor={getSchemaColor(ratePercent, theme)} />
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

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    modalWrapper: { width: '100%' },
    tooltipTextStyle: { color: theme.colorWhite, textAlign: 'center' },
    maxPoolMemberArea: { flexDirection: 'row', alignItems: 'flex-end' },
  });
}
